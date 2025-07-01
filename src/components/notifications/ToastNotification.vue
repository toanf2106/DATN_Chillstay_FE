<template>
  <!-- Toast Container -->
  <div class="toast-container" :class="positionClass">
    <transition-group name="toast">
      <div v-for="notification in positionNotifications" :key="notification.id" class="toast"
        :class="[`toast-${notification.type}`, { 'toast-visible': notification.visible }]">
        <div class="toast-icon">
          <i class="material-icons">{{ getIconForType(notification.type) }}</i>
        </div>
        <div class="toast-content">
          <div v-if="notification.title" class="toast-title">{{ notification.title }}</div>
          <div class="toast-message">{{ notification.message }}</div>
        </div>
        <button v-if="notification.dismissible" class="toast-close" @click="dismiss(notification.id)">
          <i class="material-icons">close</i>
        </button>
      </div>
    </transition-group>
  </div>

  <!-- Modal Notifications -->
  <teleport to="body">
    <transition-group name="modal-fade">
      <div v-for="notification in modalNotifications" :key="notification.id" class="modal-overlay"
        @click="notification.dismissible && dismiss(notification.id)">
        <div class="modal-container" :class="`modal-${notification.type}`" @click.stop>
          <div class="modal-icon">
            <i class="material-icons">{{ getIconForType(notification.type) }}</i>
          </div>
          <h3 class="modal-title" v-if="notification.title">{{ notification.title }}</h3>
          <div class="modal-content">{{ notification.message }}</div>
          <div class="modal-actions">
            <button v-if="notification.showCancelButton" class="modal-btn modal-btn-cancel"
              @click="cancel(notification.id)">
              {{ notification.cancelText }}
            </button>
            <button class="modal-btn modal-btn-confirm" :class="`modal-btn-${notification.type}`"
              @click="confirm(notification.id)">
              {{ notification.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'

const props = defineProps({
  position: {
    type: String,
    default: 'top-right',
    validator: (value) =>
      [
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
        'top-center',
        'bottom-center',
      ].includes(value),
  },
})

const store = useNotificationStore()

const positionClass = computed(() => `toast-${props.position}`)

const positionNotifications = computed(() => {
  return store.notifications.filter(
    (notification) =>
      notification.position === props.position && !notification.isModal && notification.visible,
  )
})

const modalNotifications = computed(() => {
  return store.notifications.filter((notification) => notification.isModal && notification.visible)
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

function dismiss(id) {
  store.dismissNotification(id)
}

function confirm(id) {
  store.confirmNotification(id)
}

function cancel(id) {
  store.cancelNotification(id)
}
</script>

<style scoped>
.toast-notification {
  min-width: 300px;
  max-width: 450px;
  background-color: #fff;
  color: #212529;
  border-radius: 6px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  z-index: 1050;
  border-left: 4px solid #ccc;
}

.toast-notification.show {
  opacity: 1;
  transform: translateY(0);
}

.toast-success {
  border-left-color: #28a745;
}

.toast-error {
  border-left-color: #dc3545;
}

.toast-warning {
  border-left-color: #ffc107;
}

.toast-info {
  border-left-color: #17a2b8;
}

.toast-header {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.toast-icon {
  margin-right: 10px;
  font-size: 1.1rem;
}

.toast-success .toast-icon {
  color: #28a745;
}

.toast-error .toast-icon {
  color: #dc3545;
}

.toast-warning .toast-icon {
  color: #ffc107;
}

.toast-info .toast-icon {
  color: #17a2b8;
}

.toast-title {
  font-weight: 600;
  color: #333;
}

.spacer {
  flex-grow: 1;
}

.toast-close {
  background: transparent;
  border: 0;
  font-size: 1.25rem;
  padding: 0;
  margin-left: 10px;
  opacity: 0.5;
  cursor: pointer;
}

.toast-close:hover {
  opacity: 1;
}

.toast-body {
  padding: 0.75rem;
  word-wrap: break-word;
}

/* Position styles */
.toast-top-right,
.toast-top-left,
.toast-top-center,
.toast-bottom-right,
.toast-bottom-left,
.toast-bottom-center {
  position: fixed;
  z-index: 1060;
}

.toast-top-right {
  top: 20px;
  right: 20px;
}

.toast-top-left {
  top: 20px;
  left: 20px;
}

.toast-top-center {
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.toast-notification.toast-top-center.show {
  transform: translateX(-50%);
}

.toast-bottom-right {
  bottom: 20px;
  right: 20px;
}

.toast-bottom-left {
  bottom: 20px;
  left: 20px;
}

.toast-bottom-center {
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.toast-notification.toast-bottom-center.show {
  transform: translateX(-50%);
}

/* Import Material Icons */
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

/* Toast Container Styles */
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
  width: 100%;
  padding: 15px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transform: translateY(-20px);
  transition: all 0.3s ease;
  overflow: hidden;
  max-height: 0;
}

.toast-visible {
  opacity: 1;
  transform: translateY(0);
  max-height: 300px;
}

/* Toast Positions */
.toast-top-right {
  top: 0;
  right: 0;
  align-items: flex-end;
}

.toast-top-left {
  top: 0;
  left: 0;
  align-items: flex-start;
}

.toast-bottom-right {
  bottom: 0;
  right: 0;
  align-items: flex-end;
}

.toast-bottom-left {
  bottom: 0;
  left: 0;
  align-items: flex-start;
}

.toast-top-center {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

.toast-bottom-center {
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  align-items: center;
}

/* Toast Components */
.toast-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
}

.toast-icon i {
  font-size: 24px;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 14px;
  line-height: 1.4;
}

.toast-close {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin-left: 8px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

.toast-close i {
  font-size: 18px;
}

/* Toast Types */
.toast-success {
  border-left: 4px solid #10b981;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info {
  border-left: 4px solid #3b82f6;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

/* Toast Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
  max-height: 0;
}

/* Modal Styles */
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

/* Modal Type Styles */
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

/* Modal Animations */
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
