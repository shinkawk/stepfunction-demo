<template>
  <div>
    <img :src="$auth.user.picture">
    <h2>{{ $auth.user.name }}</h2>
    <input v-model="input.name" type="text"  placeholder="Enter your name">
    <input v-model="input.description" type="text" placeholder="Enter taskname">
    <button class="button is-link" @click="createTodo">ADD</button>
    <ul id="todo">
      <li v-for="todo in todos" v-bind:key="todo.id">
        <span class="todo-wrapper">{{ todo.name }}</span>
        <span class="todo-wrapper">{{ todo.description }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import {API, graphqlOperation} from 'aws-amplify'
import * as mutations from '@/graphql/mutations'
import * as queries from '@/graphql/queries'

export default {
  name: 'todo',
    data: function () {
    return {
      input: {
        name: '',
        description: ''
      },
      todos: []
    }
  },
  created: async function () {
    await this.listTodos()

  },
  methods: {
    createTodo: async function () {
      if (this.input.name !== '' || this.input.description !== '') {
        await API.graphql(graphqlOperation(mutations.createTodo, {input: this.input}))
        await this.listTodos()
      } 
    },
    listTodos: async function () {
      const res = await API.graphql(graphqlOperation(queries.listTodos))
      this.todos = res.data.listTodos.items
    }
  }
}
</script>