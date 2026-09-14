export const SITE = {
  name: "Nextwave Infotech",
  legalName: "Nextwave Infotech",
  domain: "https://nextwave.com.ng",
  email: "info@nextwave.com.ng",
  metrics: {
    learners: 300,
    schools: 15,
    partners: 8,
    mentors: 20,
  },
  phone: {
    display: "+234 806 654 9337",
    whatsapp: "+2348066549337",
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
  },
} as const;
