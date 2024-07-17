import { defineStore } from 'pinia';
import axios from '../tools/axios';
import { z, ZodError } from 'zod';
import path from 'path';

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
        getShop: (state) => {
            return state;
        },
        getName: (state) => {
            return state.name;
        },
        getDescription: (state) => {
            return state.description;
        },
        getFavicon: (state) => {
            return state.favicon;
        },
        getLogo: (state) => {
            return state.logo;
        },
        getStreet: (state) => {
            return state.street;
        },
        getPostalCode: (state) => {
            return state.postalCode;
        },
        getCity: (state) => {
            return state.city;
        },
        getCountry: (state) => {
            return state.country;
        },
        getPhone: (state) => {
            return state.phone;
        },
        getEmail: (state) => {
            return state.email;
        },
        getLegalNotice: (state) => {
            return state.legalNotice;
        },
        getCgv: (state) => {
            return state.cgv;
        },
        getCgu: (state) => {
            return state.cgu;
        },
        getRgpd: (state) => {
            return state.rgpd;
        },
        getSiret: (state) => {
            return state.siret;
        },
        getTva: (state) => {
            return state.tva;
        },
        getActive: (state) => {
            return state.active;
        },
    },
    actions: {
        async fetchShop(force = false) {
            if (this.isFetched) return;

            try {
                axios.get(`${import.meta.env.VITE_API_BASE_URL}/shop`).then((response) => {
                    const validatedData = shopSchema.parse(response.data);
                    this.name = validatedData.name;
                    this.description = validatedData.description;
                    this.favicon = validatedData.favicon;
                    this.logo = validatedData.logo;
                    this.street = validatedData.street;
                    this.postalCode = validatedData.postalCode;
                    this.city = validatedData.city;
                    this.country = validatedData.country;
                    this.phone = validatedData.phone;
                    this.email = validatedData.email;
                    this.legalNotice = validatedData.legalNotice;
                    this.cgv = validatedData.cgv;
                    this.cgu = validatedData.cgu;
                    this.rgpd = validatedData.rgpd;
                    this.siret = validatedData.siret;
                    this.tva = validatedData.tva;
                    this.active = validatedData.active;
                    this.isFetched = true;
                });
            } catch (e) {
                if (e instanceof ZodError) {
                    console.error(e.errors);
                }

                console.error(e);
            }
        }
    },
});


