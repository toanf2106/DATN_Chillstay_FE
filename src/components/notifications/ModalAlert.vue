<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isVisible" class="modal-overlay" @click="closeOnClickOutside && close()">
        <div class="modal-container" :class="`modal-${type}`" @click.stop>
          <div class="modal-icon">
            <i class="material-icons">{{ getIconForType(type) }}</i>
          </div>

          <h3 class="modal-title" v-if="title">{{ title }}</h3>
          <div class="modal-content">{{ message }}</div>

          <div class="modal-actions">
            <button v-if="showCancelButton" class="modal-btn modal-btn-cancel" @click="onCancel">
              {{ cancelText }}
            </button>
            <button
              class="modal-btn modal-btn-confirm"
              :class="`modal-btn-${type}`"
              @click="onConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

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
    default: 'info', // success, error, warning, info
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value),
  },
  confirmText: {
    type: String,
    default: 'OK',
  },
  cancelText: {
    type: String,
    default: 'Hủy',
  },
  showCancelButton: {
    type: Boolean,
    default: false,
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['confirm', 'cancel', 'update:modelValue'])

const isVisible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newVal) => {
    isVisible.value = newVal
  },
)

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
      return 'help'
  }
}

function onConfirm() {
  emit('confirm')
  close()
}

function onCancel() {
  emit('cancel')
  close()
}

function close() {
  isVisible.value = false
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-container {
  background-color: #fff;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  padding: 24px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 16px;
}

.modal-icon i {
  font-size: 32px;
  color: white;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.modal-content {
  margin-bottom: 24px;
  color: #6b7280;
  font-size: 1.1rem;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
}

.modal-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
  border: none;
}

.modal-btn-cancel {
  background-color: #f3f4f6;
  color: #4b5563;
}

.modal-btn-cancel:hover {
  background-color: #e5e7eb;
}

.modal-btn-confirm {
  color: white;
}

/* Type styles */
.modal-success .modal-icon {
  background-color: #10b981;
}

.modal-btn-success {
  background-color: #10b981;
}

.modal-btn-success:hover {
  background-color: #059669;
}

.modal-error .modal-icon {
  background-color: #ef4444;
}

.modal-btn-error {
  background-color: #ef4444;
}

.modal-btn-error:hover {
  background-color: #dc2626;
}

.modal-warning .modal-icon {
  background-color: #f59e0b;
}

.modal-btn-warning {
  background-color: #f59e0b;
}

.modal-btn-warning:hover {
  background-color: #d97706;
}

.modal-info .modal-icon {
  background-color: #3b82f6;
}

.modal-btn-info {
  background-color: #3b82f6;
}

.modal-btn-info:hover {
  background-color: #2563eb;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
