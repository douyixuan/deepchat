<template>
    <section class="ollama-service-config">
        <OllamaServiceDetection v-if="step === 1" @serviceDetected="handleServiceDetection"
            @nextStep="goToModelSelection" />
        <OllamaModelSelection v-if="step === 2 && serviceDetected" :models="models" :onNext="handleModelSelection" />
        <OllamaModelConfirm v-if="step === 3 && serviceDetected" :selectedModel="selectedModel" />
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';
import OllamaServiceDetection from './OllamaServiceDetection.vue';
import OllamaModelSelection from './OllamaModelSelection.vue';
import OllamaModelConfirm from './OllamaModelConfirm.vue';

const step = ref(1);
const serviceDetected = ref(false);
const selectedModel = ref('');
const models = ref([
    { id: 'model1', name: '模型 1' },
    { id: 'model2', name: '模型 2' },
    // 这里可以添加更多模型
]);

const handleServiceDetection = (detected) => {
    serviceDetected.value = detected;
};

const goToModelSelection = () => {
    if (serviceDetected.value) {
        step.value = 2; // 进入选择模型步骤
    }
};

const handleModelSelection = (model) => {
    selectedModel.value = model;
    step.value = 3; // 进入开始聊天步骤
};

const settingsStore = useSettingsStore();
const { t } = useI18n();

const ollamaUrl = ref('http://localhost:11434');
const isConnected = ref(false);
const isChecking = ref(false);
const errorMessage = ref('');
const availableModels = ref<string[]>([]);

const ollamaProvider = computed(() => {
  return settingsStore.providers.find(p => p.id === 'ollama');
});

onMounted(async () => {
  if (ollamaProvider.value) {
    ollamaUrl.value = ollamaProvider.value.baseUrl || 'http://localhost:11434';
    
    if (ollamaProvider.value.enable) {
      await checkConnection();
    }
  }
});

async function checkConnection() {
  isChecking.value = true;
  errorMessage.value = '';
  
  try {
    const response = await fetch(`${ollamaUrl.value}/api/tags`);
    
    if (response.ok) {
      const data = await response.json();
      isConnected.value = true;
      availableModels.value = data.models.map((model: any) => model.name);
      
      if (ollamaProvider.value && !ollamaProvider.value.enable) {
        await enableOllamaProvider();
      }
    } else {
      throw new Error(`Server responded with status: ${response.status}`);
    }
  } catch (error) {
    isConnected.value = false;
    errorMessage.value = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to connect to Ollama:', error);
  } finally {
    isChecking.value = false;
  }
}

async function saveSettings() {
  if (!ollamaProvider.value) return;
  
  try {
    await settingsStore.updateProviderApi('ollama', '', ollamaUrl.value);
    await checkConnection();
  } catch (error) {
    console.error('Failed to save Ollama settings:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Unknown error when saving';
  }
}

async function enableOllamaProvider() {
  if (!ollamaProvider.value) return;
  
  try {
    await settingsStore.updateProviderStatus('ollama', true);
  } catch (error) {
    console.error('Failed to enable Ollama provider:', error);
  }
}

async function refreshModels() {
  await settingsStore.refreshProviderModels('ollama');
}
</script>

<style scoped>
.ollama-service-config {
    padding: 20px;
}
</style>