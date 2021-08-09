const express = require('express');
const axios = require('axios');
const pug = require('pug');

const app = express();
const port = 3000;

app.use('/public', express.static(__dirname + '/public'));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.set("view engine", "pug");
app.set("views", "views");

app.get("/", (req, res) => {
    res.render("index");
})

app.post("/playerResume", async (req, res) => {
    const api = {
        endPoint: "api.riotgames.com/lol/summoner/v4/summoners/by-name",
        region: "",
        summoner: "",
        key: "RGAPI-51a8311c-a124-42ce-868c-d09ed6525f31"
    }
    
    const summoner = {
        id: "",
        name: "",
        summonerLevel: "",
        profileIconId: "",
        solo: {
            tier: "",
            rank: "",
            leaguePoints: "",
            wins: "",
            losses: ""
        },
        flex: {
            tier: "",
            rank: "",
            leaguePoints: "",
            wins: "",
            losses: "" 
        }
    }

    try {
        api.summoner = await req.body.name;
        api.region = await req.body.region;
        const response_profile = await axios.get(`https://${api.region}.${api.endPoint}/` + encodeURI(api.summoner) + `?api_key=${api.key}`);
        const data_profile = await response_profile.data;

        summoner.id = await data_profile.id;
        summoner.name = await data_profile.name;
        summoner.summonerLevel = await data_profile.summonerLevel;
        summoner.profileIconId = await data_profile.profileIconId;

        api.endPoint = "api.riotgames.com/lol/league/v4/entries/by-summoner";
        api.summoner = summoner.id;

        const response_rank = await axios.get(`https://${api.region}.${api.endPoint}/` + encodeURI(api.summoner) + `?api_key=${api.key}`);
        const data_rank = await response_rank.data;

        if(data_rank.length != 0) {
            for (let c = 0; c < data_rank.length; c++) {
                if (data_rank[c].queueType === "RANKED_SOLO_5x5") {
                    summoner.solo.tier = await data_rank[c].tier;
                    summoner.solo.rank = await data_rank[c].rank;
                    summoner.solo.leaguePoints = await data_rank[c].leaguePoints;
                    summoner.solo.wins = await data_rank[c].wins;
                    summoner.solo.losses = await data_rank[c].losses;
                } else if (data_rank[c].queueType === "RANKED_FLEX_SR") {
                    summoner.flex.tier = await data_rank[c].tier;
                    summoner.flex.rank = await data_rank[c].rank;
                    summoner.flex.leaguePoints = await data_rank[c].leaguePoints;
                    summoner.flex.wins = await data_rank[c].wins;
                    summoner.flex.losses = await data_rank[c].losses;
                }
            }
        }
    
        res.render("summonerData", {
            summoner: summoner,
            hasRankSolo: summoner.solo.tier != "",
            hasRankFlex: summoner.flex.tier != "",
            summonerRegion: api.region,
        });
    } catch(e) {
        res.render("index", {
            notFound: true,
            notFound_message: "Summoner not found."
        })
    }
})

app.listen(port);