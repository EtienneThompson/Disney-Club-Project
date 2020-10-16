import axios from "axios";

var api_url = process.env.VUE_APP_HOSTNAME

export default axios.create({
    baseURL: api_url,
    timeout: 100000,
});
