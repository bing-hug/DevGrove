import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Layout/layout-view.vue'),
      children: [
        {
          path: '',
          name: 'Home',
          component: () => import('@/views/Home/home-view.vue'),
          meta: {
            title: '每日计划',
            icon: 'mdi:hot-circle'
          }
        },
        {
          path: 'life-records',
          name: 'Life',
          component: () => import('@/views/LifeRecord/life-view.vue'),
          meta: {
            title: '生活点滴',
            icon: 'mdi:journal-outline'
          }
        }
        /**
        {
          path: 'plan',
          name: 'Plan',
          component: () => import('@/views/Plan/plan-view.vue'),
          meta: {
            title: '每日总结',
            icon: 'mdi:planner-outline'
          }
        },
        {
          path: 'knowledge-tree',
          name: 'KnowledgeTree',
          component: () =>
            import('@/views/KnowledgeTree/knowledge-tree-view.vue'),
          meta: {
            title: '知识树',
            icon: 'mdi:palm-tree'
          }
        },
        {
          path: 'interview',
          name: 'Interview',
          component: () => import('@/views/Interview/interview-view.vue'),
          meta: {
            title: '面试题',
            icon: 'mdi:comment-question-outline'
          }
        }
        **/
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NoFound',
      component: () => import('@/views/NoFound/not-found-view.vue')
    }
  ]
})

export default router
