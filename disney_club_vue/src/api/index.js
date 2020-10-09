import axios from "axios";

var api_url = "http://localhost:8080/"

export default axios.create({
    baseURL: api_url,
    timeout: 100000,
});
