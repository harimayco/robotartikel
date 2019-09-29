<template>
  <v-app dark>
    <v-navigation-drawer v-model="drawer" :mini-variant="miniVariant" :clipped="clipped" fixed app>
      <template v-slot:prepend>
        <v-list>
          <v-list-item>
            <v-list-item-avatar>
              <v-img src="https://randomuser.me/api/portraits/women/85.jpg"></v-img>
            </v-list-item-avatar>
          </v-list-item>

          <v-list-item link two-line>
            <v-list-item-content>
              <v-list-item-title class="title">Sandra Adams</v-list-item-title>
              <v-list-item-subtitle>sandra_a88@gmail.com</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon>mdi-menu-down</v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </template>

      <v-divider></v-divider>

      <v-list>
        <v-list-item v-for="(item, i) in items" :key="i" :to="item.to" router exact>
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar :clipped-left="clipped" fixed app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

      <v-toolbar-title center v-text="title" />
      <img src="/robot-icon.png" class="header-logo" />
      <v-spacer />
    </v-app-bar>
    <v-content>
      <v-container>
        <nuxt />
      </v-container>
    </v-content>
    <v-navigation-drawer v-model="rightDrawer" :right="right" temporary fixed>
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light>mdi-repeat</v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer :fixed="fixed" app>
      <span>&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script>
import Logo from "~/components/Logo.vue";
export default {
  components: {
    Logo
  },
  data() {
    return {
      clipped: false,
      drawer: true,
      fixed: true,
      items: [
        {
          icon: "mdi-apps",
          title: "Welcome",
          to: "/"
        },

        {
          icon: "mdi-post",
          title: "Artikel Generator",
          to: "/artikel-generator"
        },
        {
          icon: "mdi-blogger",
          title: "Blogspot Generator",
          to: "/blogspot"
        },

        {
          icon: "mdi-wordpress",
          title: "Wordpress Generator",
          to: "/wordpress-xml-generator"
        },
        {
          icon: "mdi-chart-bubble",
          title: "Blog List",
          to: "/blog-list"
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: "Robot Artikel"
    };
  }
};
</script>

<style>
.header-logo {
  max-height: 90%;
  margin-left: 10px;
}
</style>
