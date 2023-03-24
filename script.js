let lat=28.7041,long=77.1025;
let weatherKey=${{ secrets.weatherKey }};
let geocodingKey=${{ secrets.geocodingKey }};


const refreshPage=async (data)=>{
    try{
        let rurl=`https://api.bigdatacloud.net/data/reverse-geocode`;
        config={params:{latitude:lat,longitude:long,key:geocodingKey}};
        let rgeo=await axios.get(rurl,config);
        let timedata=await axios.get(`https://api-bdc.net/data/timezone-by-location?latitude=${lat}&longitude=${long}&key=${geocodingKey}`);
        document.querySelector(".location").innerText=`${rgeo.data.city}, ${rgeo.data.countryName}`;
        let wCondition=data.weather[0].main;
        let temp=data.main.temp;
        let minTemp=data.main.temp_min;
        let maxTemp=data.main.temp_max;
        let feelTemp=data.main.feels_like;
        let humidity=data.main.humidity;
        document.querySelector(".temp").innerText=`${temp} °C`;
        document.querySelector(".mintemp").innerText=`Min: ${minTemp} °C`;
        document.querySelector(".maxtemp").innerText=`Max: ${maxTemp} °C`;
        document.querySelector(".feeltemp").innerText=`Feels like: ${feelTemp} °C`;
        document.querySelector(".humidity").innerText=`Humidity: ${humidity} %`;
        document.querySelector(".mainw").innerText=wCondition;
        if(wCondition=="Sunny")
            wCondition="Clear";
        if(!["Clear","Haze","Rain","Thunderstorm"].includes(wCondition))
            wCondition="Haze";
        if((wCondition=="Clear" || wCondition=="Haze") && ((timedata.data.localTime).substring(11,13)>18 || (timedata.data.localTime).substring(11,13)<6)){
            wCondition="Night"+wCondition;
            document.querySelector(".main").classList.add("whitetext");
        }
        else if(document.querySelector(".main").classList.contains("whitetext"))
            document.querySelector(".main").classList.remove("whitetext");
        if(wCondition=="Thunderstorm")
            document.querySelector(".main").classList.add("whitetext");
        document.body.style.backgroundImage = `url('Images/${wCondition}.jpg')`;
    }catch (error) {
        document.querySelector(".main").classList.toggle("none");
        document.querySelector(".error").classList.toggle("none");
    }
}

const findTemp=async ()=>{
    let url=`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${weatherKey}&units=metric`;
    try {
        let data=await axios.get(url);
        refreshPage(data.data);
    } catch (error) {
        document.querySelector(".main").classList.toggle("none");
        document.querySelector(".error").classList.toggle("none");
    }
}

const findLoc=async () =>{
    let s=(pos)=>{
        lat=pos.coords.latitude;
        long=pos.coords.longitude;
        findTemp();
    }
    let e=(err)=>{
        ;
    }
    navigator.geolocation.getCurrentPosition(s,e);
}

findTemp()
findLoc()

let searchForm=document.querySelector(".search");
let ol=document.querySelector(".ol");
let searchReturnData;
let locSearchFunc=async()=>{
    try{
        ol.classList.remove("none");
        if(searchForm.classList.contains("inputboxinitial")){
            document.querySelector(".searchdivinitial").classList.add("searchfinal");
            document.querySelector(".searchfinal").classList.remove("searchdivinitial");
            searchForm.classList.add("inputboxfinal");
            searchForm.classList.remove("inputboxinitial");
            document.querySelector(".searchiconinitial").classList.add("searchiconfinal");
            document.querySelector(".searchiconfinal").classList.remove("searchiconinitial");
        }
        while (ol.hasChildNodes()){
            ol.firstChild.remove();
        }
        let url="http://api.openweathermap.org/geo/1.0/direct";
        let config={params:{q:searchForm.value,appid:weatherKey,limit:5}};
        searchReturnData=await axios.get(url,config);
        for(let i=0;i<searchReturnData.data.length;i++){
            let add=searchReturnData.data[i];
            let li=document.createElement("li");
            li.innerHTML=`<img tabindex='${i}' src="Images/geo-alt-fill.svg">  ${add.name}, ${add.state}, ${add.country}`;
            ol.appendChild(li);
        }
        for(let i=0;i<(document.querySelectorAll("li").length);i++){
            document.querySelectorAll("li")[i].addEventListener("click",()=>{
                lat=searchReturnData.data[i].lat;
                long=searchReturnData.data[i].lon;
                document.querySelector(".searchfinal").classList.add("searchdivinitial");
                document.querySelector(".searchdivinitial").classList.remove("searchfinal");
                searchForm.classList.add("inputboxinitial");
                searchForm.classList.remove("inputboxfinal");
                document.querySelector(".searchiconfinal").classList.add("searchiconinitial");
                document.querySelector(".searchiconinitial").classList.remove("searchiconfinal");
                ol.classList.add("none");
                searchForm.value="";
                findTemp();
            })
            document.querySelectorAll("li")[i].addEventListener("mouseover",()=>{
                document.querySelectorAll("li img")[i].classList.toggle("lociconhovercolorchange");
            })
            document.querySelectorAll("li")[i].addEventListener("mouseout",()=>{
                document.querySelectorAll("li img")[i].classList.toggle("lociconhovercolorchange");
            })
        }
    }catch (error) {
        document.querySelector(".main").classList.toggle("none");
        document.querySelector(".error").classList.toggle("none");
    }
}

document.querySelector("img").addEventListener("click",locSearchFunc);
searchForm.addEventListener("keypress",(evt)=>{
    if(evt.key=="Enter")
        locSearchFunc();
})

document.querySelector(".main").addEventListener("click",(evt)=>{
    if(!searchForm.classList.contains("inputboxinitial")){
        document.querySelector(".searchfinal").classList.add("searchdivinitial");
        document.querySelector(".searchdivinitial").classList.remove("searchfinal");
        searchForm.classList.add("inputboxinitial");
        searchForm.classList.remove("inputboxfinal");
        document.querySelector(".searchiconfinal").classList.add("searchiconinitial");
        document.querySelector(".searchiconinitial").classList.remove("searchiconfinal");
        ol.classList.add("none");
    }
})
