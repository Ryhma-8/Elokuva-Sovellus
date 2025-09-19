import { expect } from "chai";
import { getToken, initializeTestDb, insertTestUser} from "./helpers/test.js";

describe("Testing user management", () => {

    const user = {username: "testUser", email:"foo2@test.com", password: "Password123"}
    before(async() => {
        await initializeTestDb()
        insertTestUser(user)
    })
    
    const newUser = {username: "testUser1", email:"foo@test.com", password: "Password123"}
    it("should register an account", async() => { 

        const response = await fetch("http://localhost:3001/user/register", {
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(newUser)
        })
        const data = await response.json()
        expect(response.status).to.equal(201)
        expect(data).to.include.all.keys(["id","email"])
        expect(data.email).to.equal(newUser.email)
    })

    it("should log in", async () => {
        const response = await fetch("http://localhost:3001/user/login", {
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(user)
        })
         const data = await response.json()
         const token = response.headers.get("Authorization");
        
        expect(response.status).to.equal(200)
        expect(token).to.exist
        expect(data).to.include.all.keys(["id","email"])
        expect(data.email).to.equal(user.email)
    })
})
