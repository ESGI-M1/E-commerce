import { defineStore } from 'pinia'

export const useCategoriesStore = defineStore('categories',{
    state: () => {
        return {
            categories: [],
            count: 0
        }
    },
    getters: {
        getCategories(){
            return this.categories
        },
        getCategory(id){
            return this.categories.find(c => c.id === id)
        },
        getCount(){
            return this.products.length
        },
    },
    actions: {
        setCategories(categories){
            this.categories = categories
        },
        addCategory(category){
            this.categories.push(category)
        },
        removeCategory(category){
            this.categories = this.categories.filter(c => c.id !== category.id)
        },
    }
})