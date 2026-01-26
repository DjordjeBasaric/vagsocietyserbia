export type Language = "sr" | "en";

export const translations = {
  sr: {
    // Navigation
    nav: {
      home: "Početna",
      shop: "Prodavnica",
      event: "Skup",
    },
    // Home page
    home: {
      tagline: "Zajednica VAG entuzijasta posvećena dobrim automobilima i nezaboravnim putovanjima kroz Srbiju i Evropu.",
      registerButton: "Prijava za skup",
      nextEventDate: "9. i 10. maj 2026",
      stats: {
        founded: "Osnovani",
        members: "Aktivni članovi",
        nextEvent: "Sledeći skup",
      },
      story: {
        subtitle: "Naša priča",
        title: "Na temeljima VAG nasleđa",
        paragraph1: "Vag Society Serbia je nastao iz jednostavne ideje: da okupimo što više zaljubljenika u VAG grupaciju vozila na jednom mestu kroz druženje, razmenu iskustava i zajedničke vožnje.",
        paragraph2: "Gradimo zajednicu koja neguje kvalitetne automobile, dobru energiju i nezaboravna putovanja, uz poštovanje prema kulturi i ljudima koji je stvaraju.",
      },
      gallery: {
        subtitle: "Galerija",
        title: "Neki od naših projekata",
        placeholder: "Prevucite za listanje kroz galeriju.",
      },
      join: {
        subtitle: "Pridruži se klubu",
        title: "Budi deo ove priče",
        description: "Javi nam se na Instagramu ako imaš projekat, priču ili auto koji zaslužuje da bude viđen. Upoznaj ekipu, podeli iskustvo, dođi na vožnje i putuj sa nama u nove avanture.",
      },
    },
    footer: {
      description:
        "Zvanični automobilski klub koji slavi VAG kulturu u Srbiji i šire. Pridruži se događajima, upoznaj članove i nosi klupsku opremu.",
      contactTitle: "Kontakt",
      location: "Beograd, Srbija",
      rights: "© {year} VagSocietySerbia. Sva prava zadržana.",
    },
    // Event registration
    event: {
      title: "Prijava",
      description: "Pridruži nam se na okupljanju Vag Society Serbia zajednice u Kovilovo Resortu. Cilj nam je kvalitetna postava, dobra energija i dani ispunjeni automobilima, druženjem i vožnjom. Prijave se pregledaju kako bi lineup ostao na visokom nivou.",
      details: {
        date: "Datum",
        location: "Lokacija",
        expectations: "Šta da očekujete",
      },
      form: {
        title: "Forma za prijavu",
        subtitle: "Pošaljite podatke i slike automobila. Prvo dobijate email potvrdu da je prijava na čekanju, a nakon pregleda automobila stiže finalna potvrda (ili povratna informacija) na email.",
        step1: "Korak 1",
        step2: "Korak 2",
        step3: "Korak 3",
        step1Title: "Kontakt podaci",
        step2Title: "Podaci o vozilu",
        step3Title: "Dodavanje fotografija",
        fields: {
          fullName: "Ime i prezime",
          email: "Email adresa",
          phone: "Telefon",
          country: "Država",
          city: "Grad",
          carModel: "Model automobila",
          trailer: "Dolazak sa prikolicom",
          additionalInfo: "Dodatne informacije o automobilu",
        },
        images: {
          add: "Dodirnite da dodate slike automobila",
          selected: "odabrano",
          compressing: "Kompresujem fotografije...",
          required: "Potrebno je da izaberete najmanje {min} i najviše {max} fotografija.",
          formats: "PNG, JPG, HEIC (min {min}, max {max})",
          fileTooLarge: "Fajl '{name}' je prevelik (max {max}MB po slici). Molimo izaberite manju sliku.",
          totalTooLarge: "Ukupna veličina svih slika je prevelika (max {max}MB). Molimo izaberite manje slike.",
        },
        submit: "Pošalji prijavu",
        submitting: "Slanje...",
        success: {
          title: "Uspešno ste se prijavili",
          message: "Prijava je primljena. Obavestićemo vas kada bude odobrena.",
          ok: "U redu",
        },
        successBanner: {
          title: "Prijava primljena",
          message: "Hvala na prijavi. Pregledaćemo podatke i poslati potvrdu kada prijava bude odobrena.",
        },
      },
    },
    // Shop
    shop: {
      title: "Prodavnica",
      empty: "Trenutno nema dostupnih proizvoda.",
      addToCart: "Dodaj u korpu",
      cart: "Korpa",
      cartEmpty: "Korpa je prazna. Dodajte proizvode da nastavite.",
      cartTitle: "Vaša korpa",
      cartReview: "Pregled narudžbine",
      cartClose: "Zatvori",
      checkout: "Nastavi na plaćanje",
      remove: "Ukloni",
      subtotal: "Međuzbir",
      shippingNote: "Instrukcije za isporuku i plaćanje šaljemo emailom.",
      noProductsFound: "Nema pronađenih proizvoda.",
      tryDifferentSearch: "Probaj drugu pretragu ili kategoriju.",
      showingProducts: "Prikazano {showing} od {total} proizvoda",
      category: "Kategorija",
      comingSoon: {
        subtitle: "Prodavnica",
        title: "Uskoro...",
        description: "Radimo na tome da vam donesemo nešto posebno!",
        whatTitle: "Šta dolazi?",
        bullet1: "Zvanični VagSocietySerbia proizvodi i oprema",
        bullet2: "Sigurna kupovina sa jednostavnim procesom plaćanja",
        bullet3: "Svaka kupovina podržava klubske događaje i projekte",
        follow: "Pratite nas na društvenim mrežama za najave!",
      },
      orderForm: {
        title: "Narudžbina",
        fields: {
          fullName: "Ime i prezime",
          email: "Email adresa",
          phone: "Telefon",
          shippingAddress: "Adresa za isporuku",
        },
        submit: "Pošalji narudžbinu",
        submitting: "Obrada...",
      },
    },
    // Admin
    admin: {
      events: {
        title: "Prijave za skup",
        subtitle: "Pregled prijava i odobravanje učesnika",
        tabs: {
          pending: "Na čekanju",
          approved: "Odobrene",
          declined: "Odbijene",
        },
        empty: "Nema prijava.",
        emptyPending: "Nema prijava na čekanju.",
        emptyApproved: "Nema odobrenih prijava.",
        emptyDeclined: "Nema odbijenih prijava.",
        approve: "Odobri",
        decline: "Odbij",
        confirmApprove: {
          title: "Potvrda odobravanja",
          message: "Da li ste sigurni da želite da odobrite prijavu za {name}?",
          confirm: "Potvrdi",
          cancel: "Otkaži",
          processing: "Radim...",
        },
        confirmDecline: {
          title: "Potvrda odbijanja",
          message: "Da li ste sigurni da želite da odbijete prijavu za {name}?",
          confirm: "Potvrdi",
          cancel: "Otkaži",
          processing: "Radim...",
        },
        fields: {
          car: "Auto",
          location: "Lokacija",
          trailer: "Prikolica",
          received: "Primljeno",
          noImages: "Nema otpremljenih slika.",
        },
      },
    },
  },
  en: {
    // Navigation
    nav: {
      home: "Home",
      shop: "Shop",
      event: "Event",
    },
    // Home page
    home: {
      tagline: "A community of VAG enthusiasts dedicated to great cars and unforgettable journeys through Serbia and Europe.",
      registerButton: "Register for event",
      nextEventDate: "9 and 10 May 2026",
      stats: {
        founded: "Founded",
        members: "Active members",
        nextEvent: "Next event",
      },
      story: {
        subtitle: "Our story",
        title: "Built on VAG heritage",
        paragraph1: "Vag Society Serbia was born from a simple idea: to gather as many VAG vehicle enthusiasts as possible in one place through socializing, sharing experiences, and group drives.",
        paragraph2: "We're building a community that nurtures quality cars, good energy, and unforgettable journeys, with respect for the culture and people who create it.",
      },
      gallery: {
        subtitle: "Gallery",
        title: "Some of our projects",
        placeholder: "Swipe to browse the gallery.",
      },
      join: {
        subtitle: "Join the club",
        title: "Be part of this story",
        description: "Contact us on Instagram if you have a project, story, or car that deserves to be seen. Meet the team, share your experience, come to drives and travel with us on new adventures.",
      },
    },
    footer: {
      description:
        "The official car club celebrating VAG culture in Serbia and beyond. Join events, meet members, and wear the club gear.",
      contactTitle: "Contact",
      location: "Belgrade, Serbia",
      rights: "© {year} VagSocietySerbia. All rights reserved.",
    },
    // Event registration
    event: {
      title: "Registration",
      description: "Join us at the Vag Society Serbia community gathering at Kovilovo Resort. Our goal is quality lineup, good energy, and days filled with cars, socializing, and driving. Applications are reviewed to keep the lineup at a high level.",
      details: {
        date: "Date",
        location: "Location",
        expectations: "What to expect",
      },
      form: {
        title: "Registration form",
        subtitle: "Send your details and car photos. You'll first receive an email confirmation that your application is pending, and after car review, you'll receive final confirmation (or feedback) via email.",
        step1: "Step 1",
        step2: "Step 2",
        step3: "Step 3",
        step1Title: "Contact information",
        step2Title: "Vehicle information",
        step3Title: "Add photos",
        fields: {
          fullName: "Full name",
          email: "Email address",
          phone: "Phone",
          country: "Country",
          city: "City",
          carModel: "Car model",
          trailer: "Arriving with trailer",
          additionalInfo: "Additional car information",
        },
        images: {
          add: "Tap to add car photos",
          selected: "selected",
          compressing: "Compressing photos...",
          required: "You need to select at least {min} and at most {max} photos.",
          formats: "PNG, JPG, HEIC (min {min}, max {max})",
          fileTooLarge: "File '{name}' is too large (max {max}MB per image). Please select a smaller image.",
          totalTooLarge: "Total size of all images is too large (max {max}MB). Please select fewer or smaller images.",
        },
        submit: "Submit registration",
        submitting: "Sending...",
        success: {
          title: "Successfully registered",
          message: "Registration received. We'll notify you when it's approved.",
          ok: "OK",
        },
        successBanner: {
          title: "Registration received",
          message: "Thank you for your registration. We'll review the details and send confirmation when the registration is approved.",
        },
      },
    },
    // Shop
    shop: {
      title: "Shop",
      empty: "No products available at the moment.",
      addToCart: "Add to cart",
      cart: "Cart",
      cartEmpty: "Cart is empty. Add products to continue.",
      cartTitle: "Your cart",
      cartReview: "Order review",
      cartClose: "Close",
      checkout: "Proceed to checkout",
      remove: "Remove",
      subtotal: "Subtotal",
      shippingNote: "Shipping and payment instructions will be sent via email.",
      noProductsFound: "No products found.",
      tryDifferentSearch: "Try a different search or category.",
      showingProducts: "Showing {showing} of {total} products",
      category: "Category",
      comingSoon: {
        subtitle: "Shop",
        title: "Coming soon...",
        description: "We’re working on bringing you something special!",
        whatTitle: "What’s coming?",
        bullet1: "Official VagSocietySerbia products and gear",
        bullet2: "Secure shopping with an easy checkout process",
        bullet3: "Every purchase supports club events and projects",
        follow: "Follow us on social media for updates!",
      },
      categories: {
        APPAREL: "Apparel",
        ACCESSORIES: "Accessories",
        STICKERS: "Stickers",
      },
      orderForm: {
        title: "Order",
        fields: {
          fullName: "Full name",
          email: "Email address",
          phone: "Phone",
          shippingAddress: "Shipping address",
        },
        submit: "Submit order",
        submitting: "Processing...",
      },
    },
    // Admin
    admin: {
      events: {
        title: "Event registrations",
        subtitle: "Review registrations and approve participants",
        tabs: {
          pending: "Pending",
          approved: "Approved",
          declined: "Declined",
        },
        empty: "No registrations.",
        emptyPending: "No pending registrations.",
        emptyApproved: "No approved registrations.",
        emptyDeclined: "No declined registrations.",
        approve: "Approve",
        decline: "Decline",
        confirmApprove: {
          title: "Confirm approval",
          message: "Are you sure you want to approve the registration for {name}?",
          confirm: "Confirm",
          cancel: "Cancel",
          processing: "Processing...",
        },
        confirmDecline: {
          title: "Confirm decline",
          message: "Are you sure you want to decline the registration for {name}?",
          confirm: "Confirm",
          cancel: "Cancel",
          processing: "Processing...",
        },
        fields: {
          car: "Car",
          location: "Location",
          trailer: "Trailer",
          received: "Received",
          noImages: "No images uploaded.",
        },
      },
    },
  },
} as const;

export function t(key: string, lang: Language = "sr", params?: Record<string, string | number>): string {
  const keys = key.split(".");
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to Serbian if translation missing
      value = translations.sr;
      for (const k2 of keys) {
        value = value?.[k2];
      }
      break;
    }
  }
  
  if (typeof value !== "string") {
    return key;
  }
  
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
      return String(params[paramKey] ?? `{${paramKey}}`);
    });
  }
  
  return value;
}
