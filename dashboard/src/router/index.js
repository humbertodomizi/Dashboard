import { createRouter, createWebHistory } from 'vue-router';
import DashboardHome from '../components/DashboardHome.vue';
import UserTable from '../components/UserTable.vue';
import UserForm from '../components/UserForm.vue';
import PostList from '../views/PostList.vue';
import PostForm from '../components/PostForm.vue';

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardHome
  },
  {
    path: '/users',
    name: 'users',
    component: UserTable
  },
  {
    path: '/users/new',
    name: 'user-create',
    component: UserForm
  },
  {
    path: '/users/:id/edit',
    name: 'user-edit',
    component: UserForm,
    props: true
  },
  {
    path: '/posts',
    name: 'posts',
    component: PostList
  },
  {
    path: '/posts/new',
    name: 'post-create',
    component: PostForm
  },
  {
    path: '/posts/:id/edit',
    name: 'post-edit',
    component: PostForm,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

