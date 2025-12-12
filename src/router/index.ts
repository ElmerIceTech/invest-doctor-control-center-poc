import { createRouter, createWebHistory } from 'vue-router'
import InvestDoctorScreen from '../views/InvestDoctorScreen.vue'
import AgentDetailView from '../views/AgentDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: InvestDoctorScreen,
    },
    {
      path: '/agent/:id',
      name: 'agent-detail',
      component: AgentDetailView,
      props: true,
    },
  ],
})

export default router

