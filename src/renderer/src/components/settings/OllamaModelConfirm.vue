<template>
    <div>
        <h2>步骤 3: 开始新聊天</h2>
        <p>您选择的模型是: {{ selectedModel }}</p>
        <button @click="startChat">开始聊天</button>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps(['selectedModel']);

const startChat = () => {
    console.log(`启动新聊天，使用模型: ${props.selectedModel}`);
    // 这里可以添加调用后端 API 的代码
};
</script>

<style scoped>
/* 样式 */
</style>