import { ref } from 'vue';

export default function useForm(initialState) {
    const form = ref(initialState);

    function handleChange(event) {
        form.value[event.target.name] = event.target.value;
    }

    function handleSubmit(callback) {
        return function(event) {
            event.preventDefault();
            callback(form.value);
        };
    }

    return {
        form,
        handleChange,
        handleSubmit
    };
}