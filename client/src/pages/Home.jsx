import React from "react";
import { Link } from "react-router-dom";
import hero from "../assets/hero.png";

const Home = () => {
  return (
    <div className="landing-page">
      <nav>
        <h2>GRS</h2>

        <div>
          <Link to="/">Home</Link>{" "}
          <Link to="/login">Student Login</Link>{" "}
          <Link to="/register">Register</Link>{" "}
          <Link to="/admin-login">Admin Login</Link>
        </div>
      </nav>

      <section>
        <div>
          <h1>Grievance Redressal System</h1>

          <p>
            A simple platform where students can register complaints,
            track their grievance status and communicate with the
            administration.
          </p>

          <div>
            <Link to="/register">
              <button>Register Now</button>
            </Link>

            <Link to="/login">
              <button>Student Login</button>
            </Link>
          </div>
        </div>

        <div>
          <img
            src={hero}
            alt="Grievance Redressal System"
            width="450"
          />
        </div>
      </section>
    </div>
  );
};

export default Home;