<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero py-20 text-center">
      <h1 class="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
        TikTok HQ Master
      </h1>
      <p class="text-xl text-gray-300 mb-8">
        Максимальное качество видео для TikTok
      </p>
      <router-link 
        to="/upload" 
        class="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105"
      >
        🚀 Обработать видео
      </router-link>
    </section>

    <!-- Features -->
    <section class="features py-16 px-4">
      <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div class="feature-card bg-white/10 backdrop-blur-lg p-8 rounded-2xl">
          <div class="text-5xl mb-4">🎬</div>
          <h3 class="text-2xl font-bold mb-3">Оптимизация под TikTok</h3>
          <p class="text-gray-300">Идеальные настройки кодека H.264, битрейта и разрешения</p>
        </div>
        
        <div class="feature-card bg-white/10 backdrop-blur-lg p-8 rounded-2xl">
          <div class="text-5xl mb-4">⚡</div>
          <h3 class="text-2xl font-bold mb-3">Быстрая обработка</h3>
          <p class="text-gray-300">Мощные серверы обрабатывают видео за считанные минуты</p>
        </div>
        
        <div class="feature-card bg-white/10 backdrop-blur-lg p-8 rounded-2xl">
          <div class="text-5xl mb-4">📱</div>
          <h3 class="text-2xl font-bold mb-3">Telegram бот</h3>
          <p class="text-gray-300">Обрабатывайте видео прямо из Telegram</p>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section class="pricing py-16 px-4 bg-black/30">
      <h2 class="text-4xl font-bold text-center mb-12">Тарифы</h2>
      <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <PricingCard 
          title="Бесплатный"
          price="0"
          :features="['1 видео в день', 'Водяной знак', 'До 100MB']"
        />
        <PricingCard 
          title="Базовый"
          price="299"
          :features="['30 видео в месяц', 'Без водяного знака', 'До 500MB', 'Приоритетная обработка']"
          highlighted
        />
        <PricingCard 
          title="Премиум"
          price="999"
          :features="['Неограниченно видео', 'Без водяного знака', 'До 500MB', 'Максимальный приоритет', 'Поддержка 24/7']"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import PricingCard from '../components/PricingCard.vue';
</script>