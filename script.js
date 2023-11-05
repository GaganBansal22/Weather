let lat=28.7041,long=77.1025;
let weatherKey="";
let geocodingKey="";

const refreshPage=async (data)=>{
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
        alert("Unable to fetch location");
    }
    navigator.geolocation.getCurrentPosition(s,e);
}

const initialLoad=async()=>{
    try{
        let data=await axios.get(`https://api.bigdatacloud.net/data/ip-geolocation?key=${geocodingKey}`)
        lat=data.data.location.latitude;
        long=data.data.location.longitude;
        
    }
    catch(e){
        ;
    }
    findTemp();
}
initialLoad();

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
            li.innerHTML=`<button><img tabindex='${i}' src="Images/geo-alt-fill.svg">  ${add.name}, ${add.state}, ${add.country}</button>`;
            ol.appendChild(li);
        }
        let noOfLi=document.querySelectorAll("li").length
        for(let i=0;i<noOfLi;i++){
            document.querySelectorAll("li button")[i].addEventListener("click",()=>{
                lat=searchReturnData.data[i].lat;
                long=searchReturnData.data[i].lon;
                document.querySelector(".searchfinal").classList.add("searchdivinitial");
                document.querySelector(".searchdivinitial").classList.remove("searchfinal");
                searchForm.classList.add("inputboxinitial");
                searchForm.classList.remove("inputboxfinal");
                document.querySelector(".searchiconfinal").classList.add("searchiconinitial");
                document.querySelector(".searchiconinitial").classList.remove("searchiconfinal");
                ol.classList.add("none");
                document.querySelector(".currentbutton").classList.add("none");
                searchForm.value="";
                findTemp();
            })
            document.querySelectorAll("li")[i].addEventListener("mouseover",()=>{
                document.querySelectorAll("li img")[i].classList.toggle("lociconhovercolorchange");
            })
            document.querySelectorAll("li")[i].addEventListener("mouseout",()=>{
                document.querySelectorAll("li img")[i].classList.toggle("lociconhovercolorchange");
            })
            document.querySelectorAll("li")[i].firstChild.addEventListener("keydown",(evt)=>{
                if(evt.key=="ArrowDown")
                    document.querySelectorAll("li")[(i+1)%noOfLi].firstChild.focus();
                if(evt.key=="ArrowUp"){
                    if(i==0)
                        document.querySelector(".currentbutton").focus();
                    else
                        document.querySelectorAll("li")[(i-1)%noOfLi].firstChild.focus();
                }
            })
        }
        searchForm.addEventListener("keydown",(evt)=>{
            if(evt.key=="ArrowDown")
                document.querySelector(".currentbutton").focus();
            if(evt.key=="ArrowUp")
                document.querySelectorAll("li")[noOfLi-1].firstChild.focus();
        })
        document.querySelector(".currentbutton").addEventListener("keydown",(evt)=>{
            if(evt.key=="ArrowDown")
                document.querySelector("li button").focus();
            if(evt.key=="ArrowUp")
                searchForm.focus();
        })
    }catch (error) {
        document.querySelector(".main").classList.toggle("none");
        document.querySelector(".error").classList.toggle("none");
    }
}

document.querySelector("img").addEventListener("click",locSearchFunc);
searchForm.addEventListener("focus",()=>{
    document.querySelector(".currentbutton").classList.remove("none");
})
searchForm.addEventListener("keydown",(evt)=>{
    if(evt.key=="Enter" && searchForm.value!="")
        locSearchFunc();
    if(evt.key=="ArrowDown" || evt.key=="ArrowUp")
        document.querySelector(".currentbutton").focus();
})
document.querySelector(".currentbutton").addEventListener("keydown",(evt)=>{
    if(evt.key=="ArrowDown" || evt.key=="ArrowUp")
        searchForm.focus();
    if(evt.key=="Enter"){
        document.querySelector(".currentbutton").classList.add("none");
        findLoc();
    }
})
document.querySelector(".currentbutton").addEventListener("click",()=>{
    document.querySelector(".currentbutton").classList.add("none");
    findLoc();
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
    if(!document.querySelector(".currentbutton").classList.contains("none"))
        document.querySelector(".currentbutton").classList.add("none");
})