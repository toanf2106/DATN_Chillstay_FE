<template>
  <transition name="banner-slide">
    <div v-if="show" class="banner-alert" :class="`banner-${type}`">
      <div class="banner-icon">
        <i class="material-icons">{{ getIconForType(type) }}</i>
      </div>
      <div class="banner-content">
        <div v-if="title" class="banner-title">{{ title }}</div>
        <div class="banner-message">{{ message }}</div>
      </div>
      <button v-if="dismissible" class="banner-close" @click="dismiss">
        <i class="material-icons">close</i>
      </button>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value),
  },
  dismissible: {
    type: Boolean,
    default: true,
  },
  autoHide: {
    type: Boolean,
    default: false,
  },
  duration: {
    type: Number,
    default: 5000,
  },
  modelValue: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['dismiss', 'update:modelValue'])
const show = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    show.value = newVal
  },
)

onMounted(() => {
  if (props.autoHide && props.duration > 0) {
    setTimeout(() => {
      dismiss()
    }, props.duration)
  }
})

function getIconForType(type) {
  switch (type) {
    case 'success':
      return 'check_circle'
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'info'
  }
}

function dismiss() {
  show.value = false
  emit('dismiss')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.banner-alert {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  width: 100%;
  animation: banner-slide-in 0.4s ease forwards;
}

.banner-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.banner-icon i {
  font-size: 24px;
}

.banner-content {
  flex: 1;
}

.banner-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
}

.banner-message {
  font-size: 0.95rem;
  line-height: 1.5;
}

.banner-close {
  background: transparent;
  border: none;
  cursor: pointer;
  margin-left: 16px;
  opacity: 0.7;
  transition: opacity 0.2s;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-close:hover {
  opacity: 1;
}

.banner-close i {
  font-size: 20px;
}

/* Types */
.banner-success {
  background-color: rgba(16, 185, 129, 0.1);
  border-left: 4px solid #10b981;
}

.banner-success .banner-icon {
  color: #10b981;
}

.banner-error {
  background-color: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
}

.banner-error .banner-icon {
  color: #ef4444;
}

.banner-warning {
  background-color: rgba(245, 158, 11, 0.1);
  border-left: 4px solid #f59e0b;
}

.banner-warning .banner-icon {
  color: #f59e0b;
}

.banner-info {
  background-color: rgba(59, 130, 246, 0.1);
  border-left: 4px solid #3b82f6;
}

.banner-info .banner-icon {
  color: #3b82f6;
}

/* Animations */
@keyframes banner-slide-in {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.banner-slide-enter-active {
  animation: banner-slide-in 0.4s ease forwards;
}

.banner-slide-leave-active {
  animation: banner-slide-out 0.3s ease forwards;
}

@keyframes banner-slide-out {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-20px);
    opacity: 0;
  }
}
</style>
