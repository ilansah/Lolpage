<script setup>
defineProps({
  modelValue: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: 'Rechercher…'
  },
  resultCount: {
    type: Number,
    default: 0
  },
  resultLabel: {
    type: String,
    default: 'résultat'
  }
});

defineEmits(['update:modelValue']);
</script>

<template>
  <div class="search-wrap">
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      type="text"
      :placeholder="placeholder"
      class="search-input"
    />
    <span class="search-count">{{ resultCount }} {{ resultLabel }}{{ resultCount > 1 ? 's' : '' }}</span>
  </div>
</template>

<style scoped>
.search-wrap {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(200, 155, 60, 0.4);
  border-radius: 8px;
  padding: 0.6rem 1rem;
  color: #f0e6d2;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input::placeholder {
  color: #a09b8c;
}

.search-input:focus {
  border-color: #c89b3c;
  box-shadow: 0 0 0 2px rgba(200, 155, 60, 0.15);
}

.search-count {
  color: #a09b8c;
  font-size: 0.85rem;
  white-space: nowrap;
}
</style>
