import { expect } from "chai";
import axios from "axios";
import jwt from "jsonwebtoken";
import { initializeTestDb, insertTestUser } from "./helpers/test.js";
import { pool } from "./helpers/db.js";

const BASE_URL = "http://localhost:3001/user";
const REVIEW_URL = "http://localhost:3001/api/reviews";

describe("Full user management and reviews tests (axios)", () => {
  const user = { username: "testUser", email: "foo2@test.com", password: "Password123" };
  const loginUser = {email: "foo2@test.com", password: "Password123" };
  const newUser = { username: "testUser1", email: "foo@test.com", password: "Password123" };
  let accessToken = "";
  let reviewUserId = null;
  let refreshToken = "";

  before(async () => {
    // 1. Alusta testidatabase
    await initializeTestDb();

    // 2. Lisää testikäyttäjä
    const createdUser = await insertTestUser(user);
    reviewUserId = createdUser.id;

    // 3. Kirjaudu sisään ja tallenna accessToken
    const loginResp = await axios.post(`${BASE_URL}/login`, user);

    let token = loginResp.headers["authorization"];
    // Poistetaan mahdollinen "Bearer " prefix
    accessToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;

    // Jos refresh-token tulee cookieissa, tallenna se
    const setCookieHeader = loginResp.headers["set-cookie"];
    if (setCookieHeader) {
      const match = setCookieHeader[0].match(/refreshToken=(.*?);/);
      if (match) refreshToken = match[1];
    }

    // 4. Lisää arvostelut
    await axios.post(
      REVIEW_URL,
      { movie_id: 101, title: "Test Review 1", description: "Description 1", rating: 5 },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    await axios.post(
      REVIEW_URL,
      { movie_id: 101, title: "Test Review 2", description: "Description 2", rating: 4 },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  });

  // ===== User management =====
  it("should register an account", async () => {
    const response = await axios.post(`${BASE_URL}/register`, newUser);
    expect(response.status).to.equal(201);
    expect(response.data).to.include.all.keys(["id", "email"]);
    expect(response.data.email).to.equal(newUser.email);
  });

  it("should fail to register duplicate email", async () => {
    try {
      await axios.post(`${BASE_URL}/register`, user);
    } catch (err) {
      expect(err.response.status).to.equal(400);
    }
  });

  it("should log in successfully", async () => {
    const response = await axios.post(`${BASE_URL}/login`, user);
    let token = response.headers["authorization"];
    accessToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
    expect(response.status).to.equal(200);
    expect(accessToken).to.exist;
    expect(response.data).to.include.all.keys(["id", "email"]);
    expect(response.data.email).to.equal(user.email);
  });

  // ===== Negative login test =====
  it("should fail to log in with wrong password", async () => {
    try {
      await axios.post(`${BASE_URL}/login`, { email: user.email, password: "WrongPassword!" });
    } catch (err) {
      expect(err.response.data).to.have.property("err");
      expect(err.response.data.err).to.have.property("message");
      console.log("Negative login error message:", err.response.data.err.message);
    }
  });

  // ===== Reviews =====
  it("should list reviews successfully", async () => {
    const response = await axios.get(`${REVIEW_URL}?movie_id=101`);
    expect(response.status).to.equal(200);
    expect(response.data).to.be.an("array");
    expect(response.data.length).to.equal(2);
    expect(response.data[0]).to.include.all.keys([
      "id",
      "account_id",
      "movie_id",
      "title",
      "description",
      "rating",
      "created_at",
      "author_email",
    ]);
    console.log("Reviews fetched:", response.data);
  });

  it("should fail to list reviews with invalid movie_id", async () => {
    try {
      await axios.get(`${REVIEW_URL}?movie_id=-1`);
    } catch (err) {
      expect(err.response.status).to.equal(400);
    }
  });

  // ===== Logout =====
  it("should log out successfully with accessToken", async () => {
    const logResponse = await axios.post(`${BASE_URL}/login`, loginUser);
    let token = logResponse.headers["authorization"];
    let refreshToken = logResponse.headers["set-cookie"][0];
    const response = await axios.get(`${BASE_URL}/logout`, {
    headers: { 
      Authorization: token, 
      Cookie: `refreshToken=${refreshToken}` 
    },
    validateStatus: () => true
  });
    expect(response.status).to.equal(204);
    console.log("Logout headers:", response.headers);
  });

  it("should fail to log out without accessToken", async () => {
    try {
      await axios.get(`${BASE_URL}/logout`);
    } catch (err) {
      expect(err.response.data.err.message).to.equal("Unauthorized");
      console.log("Logout without token error:", err.response.data.err.message);
    }
  });

  // ===== Delete account =====
  describe("Delete account tests", () => {

    before(async () => {
      // Hanki tuore accessToken delete-testia varten
      const loginResp = await axios.post(`${BASE_URL}/login`, user);
      let token = loginResp.headers["authorization"];
      accessToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
      console.log("AccessToken refreshed for delete tests:", `Bearer ${accessToken}`);
    });

    it("should delete account successfully with valid token", async () => {
      const response = await axios.delete(`${BASE_URL}/delete`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        validateStatus: () => true
      });
      expect(response.status).to.equal(204);
    });

    it("should fail to delete account without token", async () => {
      try {
        await axios.delete(`${BASE_URL}/delete`);
      } catch (err) {
        expect(err.response.data.err.message).to.equal("Unauthorized");
        console.log("Delete without token error:", err.response.data.err.message);
      }
    });

    it("should fail to delete account with invalid token", async () => {
      try {
        await axios.delete(`${BASE_URL}/delete`, {
          headers: { Authorization: `Bearer invalidtoken123` }
        });
      } catch (err) {
        expect(err.response.data.err.message).to.equal("Unauthorized");
        console.log("Delete with invalid token error:", err.response.data.err.message);
      }
    });

  });
});
