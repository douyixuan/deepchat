<template>
    <div>
        <h2>步骤 2: 选择模型</h2>
        <select v-model="selectedModel">
            <option v-for="model in models" :key="model.id" :value="model.id">
                {{ model.name }}
            </option>
        </select>
        <button @click="nextStep" :disabled="!selectedModel">下一步</button>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';

const props = defineProps(['models', 'onNext']);
const selectedModel = ref('');

const nextStep = () => {
    if (selectedModel.value) {
        onNext(selectedModel.value);
    }
};
</script>

<style scoped>
/* 样式 */
</style>