import axios from "axios";

var api_url = "https://disney-club-project.herokuapp.com/"


export default axios.create({
    baseURL: api_url,
    timeout: 100000,
});
