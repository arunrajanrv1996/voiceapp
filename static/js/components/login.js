import navbar from "./navbar.js";
import footerr from "./footer.js";
const Login = Vue.component("login", {
  template: `
    <div>
    <navbar></navbar>
    <div class="login-container">
    <!-- Token-based login form -->
    <div v-if="showloginform" class="paper-form-container">
      <h2 class="form-title">Login</h2>
      <div v-if="showmessage" class="alert alert-danger" role="alert">
        {{ msg }}
      </div>
      <form @submit.prevent="login" class="login-form">
        <!-- Form fields -->
        <div class="mb-3">
          <label for="admin_name" class="form-label">Username</label>
          <input
            type="text"
            class="form-control"
            id="username"
            name="username"
            v-model="username"
            required
          />
        </div>
        <div class="mb-3">
          <label for="password" class="form-label">Password</label>
          <input
            type="password"
            class="form-control"
            id="password"
            name="password"
            v-model="password"
            required
          />
        </div>

        <div class="text-center">
          <button type="submit" class="submit-button">Login</button>
        </div>
      </form>
      <div class="text-center" style="margin-top:20px;">
        <p>Don't have an account? <router-link to="/register">Register</router-link></p>
      </div>
    </div>
  </div>
    <footerr></footerr>
  </div>
        `,
  components: {
    navbar,
    footerr,
  },
  data() {
    return {
      showroute: true,
      showmessage: false,
      msg: "",
      create: false,
      username: "",
      password: "",
      authenticated: false,
      showloginform: true,
    };
  },

  methods: {
    login() {
      const payload = {
        username: this.username,
        password: this.password,
      };
      fetch("/userlogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Invalid Username/password");
          }
        })
        .then((data) => {
          if (data.message == "No user found!") {
            this.showmessage = true;
            setTimeout(() => {
              this.showmessage = false;
            }, 3000);
            this.msg = data.message;
          }
          if (data.message == "Wrong Password") {
            this.showmessage = true;
            setTimeout(() => {
              this.showmessage = false;
            }, 3000);
            this.msg = data.message;
          } else {
            if (data.user_id) {
              console.log(data);
              localStorage.setItem("token", data.token);
              localStorage.setItem("user_id", data.user_id);
              this.$router.push("/");
            }
          }
        })
        .catch((error) => {
          this.showmessage = true;
          setTimeout(() => {
            this.showmessage = false;
          }, 3000);
          this.msg = "Invalid Username/password";
          console.error(error);
        });
    },
  },
});

export default Login;
