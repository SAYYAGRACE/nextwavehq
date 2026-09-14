export const SITE = {
  name: "Nextwave Infotech",
  legalName: "Nextwave Infotech",
  domain: "https://nextwave.com.ng",
  email: "info@nextwave.com.ng",
  phone: {
    display: "TBD — add WhatsApp/phone",
    whatsapp: "", // e.g. "+2348012345678" (international format, no spaces)
  },
  location: {
    area: "Kawo, Kaduna",
    city: "Kaduna State",
    country: "Nigeria",
    full: "Kawo, Kaduna State, Nigeria",
  },
  socials: {
    x: { handle: "@nextwaveorg", url: "https://x.com/nextwaveorg" },
    instagram: { handle: "@nextwaveafrica", url: "https://instagram.com/nextwaveafrica" },
  },
  partners: [
    { name: "Hutsoft Technologies", kind: "Engineering Partner" },
    { name: "Specterverse Gaming", kind: "Partner Company" },
    { name: "Muda International School", kind: "Approving School" },
  ],
  bootcamp: {
    status: "Active",
    location: "Kawo, Kaduna",
    tracks: [
      "Foundations (Primary & Secondary)",
      "Specializations (Undergraduate)",
      "Growth Hub (Founders & SMEs)",
    ],
    cohort: {
      running: true,
      label: "Current cohort — in session",
      number: "Cohort 01",
      // dates + enrolments to be confirmed
      details: "",
    },
  },
} as const;
