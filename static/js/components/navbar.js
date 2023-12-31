const navbar = Vue.component("navbar", {
  template: `
      <div>
        <nav class="navbar navbar-light" style="background-color: #e3f2fd;">
          <div class="container-fluid">
            <router-link class="navbar-brand" to="/">
              <img src="/static/js/images/record.png" alt="Avatar Logo" style="width:40px;" class="rounded-pill"> 
              <span class="navbar-text">Voice Analyzer</span>
            </router-link>
            <div class="d-flex ms-auto"> <!-- Move to the right -->
              <router-link class="nav-link" to="/" v-if="token">
                <span class="navbar-text">Home</span>
              </router-link>
              <router-link class="nav-link" to="/profile" v-if="token">
                <span class="navbar-text">Profile</span>
              </router-link>
              <router-link v-if="!token" class="nav-link" to="/login">
                <span class="navbar-text">Login/Register</span>
              </router-link>
              <button v-if="token" @click="logout" class="btn btn-link nav-link">
                <span class="navbar-text"><i class="fas fa-sign-out-alt"></i>Logout</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    `,
  data() {
    return {
      token: localStorage.getItem("auth_token"),
    };
  },
  methods: {
    logout() {
      // Perform logout actions and remove the token from localStorage
      fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": this.token,
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
          localStorage.removeItem("auth_token");
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
