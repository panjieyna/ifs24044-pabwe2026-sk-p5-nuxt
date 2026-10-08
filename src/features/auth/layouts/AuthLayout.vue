<template>
  <main class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900">
    <section class="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl border border-blue-100" aria-label="Autentikasi">
      <div class="flex items-center gap-3 mb-6">
        <div class="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
          D
        </div>
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-900">Delcom Cash Flow</h1>
          <p class="text-xs text-slate-500 font-medium">Manajemen Arus Kas Pintar & Praktis</p>
        </div>
      </div>
      <RouterView />
    </section>
  </main>
</template>
