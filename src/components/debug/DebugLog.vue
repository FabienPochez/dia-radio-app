<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h1 class="text-xl font-bold mb-4">🎧 Playback Debug Logs</h1>
<div class="mb-6">
  <Button variant="secondary" @click="showModal = true" class="h-8 px-3 text-sm">
    📋 Comment remonter un bug ?
  </Button>

</div>

<Dialog v-model:open="showModal">
  <DialogContent class="max-w-xl bg-neutral-900 text-sm">
    <DialogHeader>
      <DialogTitle>Aide au débogage</DialogTitle>
    </DialogHeader>
    <div class="space-y-3 leading-relaxed">
      <p>Merci de nous filer un coup de main pour améliorer l’app ! Voici comment tester le lecteur et nous envoyer un retour utile :</p>

      <p class="text-sm text-yellow-600 font-medium">
        🔄 Avant de tester : ferme complètement l’app (depuis TestFlight), puis relance-la.  
        → Ça garantit que tu as bien la dernière version avec tous les outils de debug.
      </p>

      <strong>🎧 Ce qu’on cherche à tester :</strong>
      <ul class="list-disc pl-5">
        <li>Écoute longue (20+ minutes)</li>
        <li>Changer d’app (Spotify, NTS…)</li>
        <li>Utiliser les contrôles de l’écran verrouillé</li>
        <li>Utiliser AirPlay ou des écouteurs Bluetooth</li>
        <li>Mettre en pause / lecture via l’iPhone</li>
      </ul>

      <strong>📋 Si tu rencontres un bug :</strong>
      <ol class="list-decimal pl-5">
        <li>Va dans l’onglet <strong>Bug</strong></li>
        <li>Repère la ligne du bug → <code>Playback time frozen</code>, <code>Playback stalled</code>, etc.</li>
        <li>Regarde au-dessus pour trouver la ligne <code>Audio loaded</code></li>
        <li>Copie ce bloc de lignes uniquement (pas tout)</li>
        <li>Envoie ça sur Discord ou par message ✅</li>
      </ol>

      <p><strong>💡 Sois précis :</strong>  
        <em>“Le stream s’est coupé après 18 min, j’étais en Bluetooth avec l’app en arrière-plan.”</em>
      </p>

      <p>👉 Tu peux envoyer ton retour directement sur  
        <a
          href="https://discord.com/channels/951414693581447168/1376534154732371968"
          target="_blank"
          class="text-blue-500 underline"
        >
          notre canal Discord #dia-app
        </a> 💬
      </p>
    </div>
  </DialogContent>
</Dialog>




    <div v-if="logs.length === 0" class="text-gray-400">No logs yet.</div>
    <div v-for="(log, index) in logs" :key="index" class="mb-4 border-b pb-2">
      <p class="text-xs text-gray-500">{{ log.timestamp }}</p>
      <p class="text-sm font-semibold">{{ log.message }}</p>
      <pre v-if="Object.keys(log.data || {}).length" class="truncate bg-neutral-800 text-xs p-2 rounded-sm mt-1">
{{ JSON.stringify(log.data, null, 2) }}
      </pre>
    </div>
    <button
      @click="clearLogs"
      class="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-sm"
    >
      Clear Logs
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePlayerLogs } from '@/composables/playerLogs.js'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'


const { logs } = usePlayerLogs()
const showModal = ref(false)

function clearLogs() {
  logs.value.length = 0
}
</script>

