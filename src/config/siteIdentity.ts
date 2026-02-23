export const siteIdentity = {
  brandName: "Vertical Tension Press",
  contact: {
    email: "inquiries@verticaltension.com",
    emailHref: "mailto:inquiries@verticaltension.com",
    phoneDisplay: "+49 178 3204703",
    phoneHref: "tel:+491783204703",
  },
  address: {
    street: "Kolonnenstraße 8",
    postalCodeCity: "10827 Berlin",
    countryCode: "DE",
    countryEN: "Germany",
    countryDE: "Deutschland",
  },
  management: {
    managingDirector: "Marvin G. Johnson",
  },
  tax: {
    vatId: "DE307965566",
  },
};

export const siteIdentityText = {
  addressLine: `${siteIdentity.address.street}, ${siteIdentity.address.postalCodeCity}`,
  addressLineEN: `${siteIdentity.address.street}, ${siteIdentity.address.postalCodeCity}, ${siteIdentity.address.countryEN}`,
  addressLineDE: `${siteIdentity.address.street}, ${siteIdentity.address.postalCodeCity}, ${siteIdentity.address.countryDE}`,
};
