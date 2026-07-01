-- Staff Messaging System

-- 1. Conversations table
CREATE TABLE public.staff_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  subject text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Messages table
CREATE TABLE public.staff_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.staff_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_email text NOT NULL,
  sender_name text NOT NULL,
  sender_role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Conversation participants
CREATE TABLE public.staff_conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.staff_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  user_name text NOT NULL,
  user_role text NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_read_at timestamptz,
  UNIQUE(conversation_id, user_id)
);

-- Indexes
CREATE INDEX idx_staff_messages_conversation_id ON public.staff_messages(conversation_id, created_at DESC);
CREATE INDEX idx_staff_conversation_participants_user_id ON public.staff_conversation_participants(user_id);
CREATE INDEX idx_staff_conversation_participants_conversation_id ON public.staff_conversation_participants(conversation_id);

-- RLS
ALTER TABLE public.staff_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_conversation_participants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Staff read own conversations" ON public.staff_conversations FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.staff_conversation_participants WHERE conversation_id = id AND user_id = auth.uid()));
CREATE POLICY "Staff create conversations" ON public.staff_conversations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Staff read messages" ON public.staff_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.staff_conversation_participants WHERE conversation_id = staff_messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "Staff send messages" ON public.staff_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Staff read participants" ON public.staff_conversation_participants FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.staff_conversation_participants cp WHERE cp.conversation_id = staff_conversation_participants.conversation_id AND cp.user_id = auth.uid()));
CREATE POLICY "Staff add participants" ON public.staff_conversation_participants FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.staff_conversation_participants WHERE conversation_id = staff_conversation_participants.conversation_id AND user_id = auth.uid()));

-- Grants
GRANT SELECT, INSERT ON public.staff_conversations TO authenticated;
GRANT SELECT, INSERT ON public.staff_messages TO authenticated;
GRANT SELECT, INSERT ON public.staff_conversation_participants TO authenticated;
GRANT ALL ON public.staff_conversations TO service_role;
GRANT ALL ON public.staff_messages TO service_role;
GRANT ALL ON public.staff_conversation_participants TO service_role;

-- Helper function
CREATE OR REPLACE FUNCTION public.get_all_staff()
RETURNS TABLE (id uuid, email text, name text, role text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'name', u.email) as name, r.role FROM auth.users u JOIN public.user_roles r ON r.user_id = u.id WHERE r.role = 'admin' ORDER BY name;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_staff() TO authenticated;
