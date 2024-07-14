// shop.ts
import { defineStore } from 'pinia';
import axios from '../tools/axios';
import { z } from 'zod';

const shopSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  favicon: z.string(),
  logo: z.string(),
  street: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
  phone: z.string().optional(),
  email: z.string().email(),
  legalNotice: z.string(),
  cgv: z.string(),
  cgu: z.string(),
  rgpd: z.string(),
  siret: z.string(),
  tva: z.string(),
  active: z.boolean(),
  isFetched: z.boolean().optional(),
});

export const useShopStore = defineStore('shop', {
    state: () => ({
        name: '',
        description: '',
        favicon: '',
        logo: '',
        street: '',
        postalCode: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        legalNotice: '',
        cgv: '',
        cgu: '',
        rgpd: '',
        siret: '',
        tva: '',
        active: true,
        isFetched: false,
    }),
    getters: {
        getShop: (state) => ({
        name: state.name,
        description: state.description,
        favicon: state.favicon,
        logo: state.logo,
        street: state.street,
        postalCode: state.postalCode,
        city: state.city,
        country: state.country,
        phone: state.phone,
        email: state.email,
        legalNotice: state.legalNotice,
        cgv: state.cgv,
        cgu: state.cgu,
        rgpd: state.rgpd,
        siret: state.siret,
        tva: state.tva,
        active: state.active,
        }),
        getShopName: (state) => state.name,
        getShopDescription: (state) => state.description,
        getShopFavicon: (state) => state.favicon,
        getShopLogo: (state) => state.logo,
        getShopStreet: (state) => state.street,
        getShopPostalCode: (state) => state.postalCode,
        getShopCity: (state) => state.city,
        getShopCountry: (state) => state.country,
        getShopPhone: (state) => state.phone,
        getShopEmail: (state) => state.email,
        getShopLegalNotice: (state) => state.legalNotice,
        getShopCgv: (state) => state.cgv,
        getShopCgu: (state) => state.cgu,
        getShopRgpd: (state) => state.rgpd,
        getShopSiret: (state) => state.siret,
        getShopTva: (state) => state.tva,
        getShopActive: (state) => state.active,
    },
    actions: {
        async fetchShop() {
        if (this.isFetched) return;

        try {
            const response = await axios.get('/shop');
            const validatedData = shopSchema.parse(response.data);

            this.name = validatedData.name;
            this.description = validatedData.description || '';
            this.favicon = validatedData.favicon;
            this.logo = validatedData.logo;
            this.street = validatedData.street;
            this.postalCode = validatedData.postalCode;
            this.city = validatedData.city;
            this.country = validatedData.country;
            this.phone = validatedData.phone || '';
            this.email = validatedData.email;
            this.legalNotice = validatedData.legalNotice;
            this.cgv = validatedData.cgv;
            this.cgu = validatedData.cgu;
            this.rgpd = validatedData.rgpd;
            this.siret = validatedData.siret;
            this.tva = validatedData.tva;
            this.active = validatedData.active;
            this.isFetched = true;
        } catch (e) {
            console.error(e);
        }
        }
    }
});
