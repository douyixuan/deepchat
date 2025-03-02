<template>
    <div>
        <h2>步骤 1: 检测服务</h2>
        <p v-if="serviceDetected">Ollama 服务正在运行！</p>
        <p v-else>正在检测 Ollama 服务...</p>
        <button @click="checkService">重新检测</button>
        <button v-if="serviceDetected" @click="nextStep">下一步</button>
    </div>
</template>

<script setup lang="ts">
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['serviceDetected', 'nextStep']);

const serviceDetected = ref(false);

const checkService = async () => {
    const response = await fetch('/api/check-ollama-service');
    serviceDetected.value = response.ok;
    emit('serviceDetected', serviceDetected.value);
};

const nextStep = () => {
    emit('nextStep');
};
</script>

<style scoped>
/* 样式 */
</style>