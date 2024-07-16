import { defineStore } from 'pinia';
import axios from '../tools/axios';
import { z, ZodError } from 'zod';

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
    mainCategories: z.array(z.object({
        id: z.number(),
        name: z.string(),
        slug: z.string(),
        active: z.boolean(),
        subCategories: z.array(z.object({
            id: z.number(),
            name: z.string(),
            slug: z.string(),
            active: z.boolean(),
        })).optional(),
    })).optional(),
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
        isLoading: false,
        mainCategories: [],
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
        getMainCategories: (state) => {
            return state.mainCategories;
        },
    },
    actions: {
        async fetchShop(force = false) {
            if (this.isFetched && !force || this.isLoading) return;

            try {
                this.isLoading = true;
                axios.get(`${import.meta.env.VITE_API_BASE_URL}/shop`).then((response) => {
                    const shop = shopSchema.parse(response.data);
                    this.name = shop.name;
                    this.description = shop.description;
                    this.favicon = shop.favicon;
                    this.logo = shop.logo;
                    this.street = shop.street;
                    this.postalCode = shop.postalCode;
                    this.city = shop.city;
                    this.country = shop.country;
                    this.phone = shop.phone;
                    this.email = shop.email;
                    this.legalNotice = shop.legalNotice;
                    this.cgv = shop.cgv;
                    this.cgu = shop.cgu;
                    this.rgpd = shop.rgpd;
                    this.siret = shop.siret;
                    this.tva = shop.tva;
                    this.active = shop.active;
                    this.mainCategories = shop.mainCategories;
                    this.isFetched = true;
                })
                .finally(() => {
                    this.isLoading = false;
                });
            } catch (e) {
                if (e instanceof ZodError) {
                    console.error(e.errors);
                } else {
                    console.error(e);
                }
            }
        },
    },
});
