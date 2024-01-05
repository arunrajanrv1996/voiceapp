const navbar = Vue.component("navbar", {
  template: `
      <div>
        <nav class="navbar navbar-light" style="background-color: #e3f2fd;">
          <div class="container">
            <router-link class="navbar-brand" to="/">
              <img src="/static/js/images/record.png" alt="Avatar Logo" style="width:40px;" class="rounded-pill"> 
              <span class="navbar-text"><strong>Voice Analyzer</strong></span>
            </router-link>
            <div class="d-flex ms-auto"> <!-- Move to the right -->
              <router-link class="nav-link active" to="/" v-if="user_id">
                <span class="navbar-text"><strong>Home</strong></span>
              </router-link>
              <router-link class="nav-link active" to="/profile" v-if="user_id">
                <span class="navbar-text"><strong>Profile</strong></span>
              </router-link>
              <router-link v-if="!user_id" class="nav-link active" to="/login">
                <span class="navbar-text"><strong>Login/Register</strong></span>
              </router-link>
              <button v-if="user_id" @click="logout" class="btn btn-link nav-link active">
                <span class="navbar-text"><i class="fas fa-sign-out-alt"></i><strong>Logout</strong></span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    `,
  data() {
    return {
      user_id: localStorage.getItem("token") || "",
    };
  },
  methods: {
    logout() {
      // Perform logout actions and remove the token from localStorage
      fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Logout failed.");
          } else {
            return response.json();
          }
        })
        .then((data) => {
          localStorage.removeItem("token");
          this.token = "";
          this.$router.push("/");
          location.reload();
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
});

export default navbar;
