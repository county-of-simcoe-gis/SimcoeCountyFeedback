import React, { useState, useEffect } from "react";
import "./App.css";
import Checkbox from "./Checkbox";
import Ratings from "react-ratings-declarative";
import { GoogleReCaptchaProvider, GoogleReCaptcha } from "react-google-recaptcha-v3";
import config from "./config.json";
import ReactGA from "react-ga4";
import { detect } from "detect-browser";

if (config.googleAnalyticsID !== undefined && config.googleAnalyticsID !== "") {
  ReactGA.initialize(config.googleAnalyticsID);
  ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
}

const postUrl = config.postUrl;
const getUrl = config.getUrl;

// RECAPTCHA DETAILS DEV
// const key = config.devCaptchaKey; // DEV
// const captchaResponseUrl = config.devCaptchaResponseUrl;

// RECAPTCHA DETAILS PRODUCTION
const key = config.productionCaptchaKey;
const captchaResponseUrl = config.productionCaptchaResponseUrl;

const App = () => {
  const [chkEducation, setChkEducation] = useState(false);
  const [chkRecreation, setChkRecreation] = useState(false);
  const [chkRealEstate, setChkRealEstate] = useState(false);
  const [chkBusiness, setChkBusiness] = useState(false);
  const [chkDelivery, setChkDelivery] = useState(false);
  const [chkEconomicDevelopment, setChkEconomicDevelopment] = useState(false);
  const [chkRelyOnBusiness, setChkRelyOnBusiness] = useState(false);
  const [chkIncludeMapScaleAndExtent, setChkIncludeMapScaleAndExtent] = useState(true);
  const [rating, setRating] = useState(2.5);
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [otherUses, setOtherUses] = useState("");
  const [botDetected, setBotDetected] = useState(false);
  const [reportProblem, setReportProblem] = useState(false);
  const [myMapsId, setMyMapsId] = useState(null);
  const [featureId, setFeatureId] = useState(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  useEffect(() => {
    // HANDLE URL PARAMETERS (ADVANCED)
    const url = new URL(window.location.href);

    const reportProblem = url.searchParams.get("REPORT_PROBLEM");
    if (reportProblem !== null) {
      setReportProblem(true);
      setChkIncludeMapScaleAndExtent(true);
    }

    const myMapsId = url.searchParams.get("MY_MAPS_ID");
    if (myMapsId !== null) {
      setMyMapsId(myMapsId);
    }

    const featureId = url.searchParams.get("MY_MAPS_FEATURE_ID");
    if (featureId !== null) {
      setFeatureId(featureId);
    }

    const id = url.searchParams.get("ID");
    if (id !== null) {
      getJSON(getUrl + id, (result) => {
        setChkEducation(result.education ? result.education : false);
        setChkRecreation(result.recreation ? result.recreation : false);
        setChkRealEstate(result.real_estate ? result.real_estate : false);
        setChkBusiness(result.business ? result.business : false);
        setChkDelivery(result.delivery ? result.delivery : false);
        setChkEconomicDevelopment(result.economic_development ? result.economic_development : false);
        setChkRelyOnBusiness(result.for_business_use ? result.for_business_use : false);
        setRating(result.rating);
        setEmail(result.email ? result.email : "");
        setComments(result.comments ? result.comments : "");
        setOtherUses(result.other_uses ? result.other_uses : "");
        setChkIncludeMapScaleAndExtent(result.report_problem ? result.report_problem : false);
        setReportProblem(result.report_problem === null ? false : result.report_problem);
      });
    }
  }, []);

  const changeRating = (newRating) => {
    setRating(newRating);
  };

  const onResetButton = () => {
    setChkEducation(false);
    setChkRecreation(false);
    setChkRealEstate(false);
    setChkBusiness(false);
    setChkDelivery(false);
    setChkEconomicDevelopment(false);
    setChkRelyOnBusiness(false);
    setChkIncludeMapScaleAndExtent(true);
    setRating(2.5);
    setEmailValid(true);
    setOtherUses("");
  };

  const onEmailChange = (evt) => {
    setEmail(evt.target.value);
  };

  const onOtherUsesChange = (evt) => {
    setOtherUses(evt.target.value);
  };

  const onCommentsChange = (evt) => {
    setComments(evt.target.value);
  };

  const onSendFeedbackButton = () => {
    if (!validateEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setFeedbackSubmitting(true);
    // GET CHECKBOX ANSWERS
    let usage = [];
    if (chkEducation) usage.push("Education");
    if (chkRecreation) usage.push("Recreation");
    if (chkRealEstate) usage.push("Real Estate");
    if (chkBusiness) usage.push("Business");
    if (chkDelivery) usage.push("Delivery");
    if (chkEconomicDevelopment) usage.push("Economic Development");

    // GET URL PARAMETERS
    const url = new URL(window.location.href);
    const xmin = url.searchParams.get("xmin");
    const xmax = url.searchParams.get("xmax");
    const ymin = url.searchParams.get("ymin");
    const ymax = url.searchParams.get("ymax");
    const centerx = url.searchParams.get("centerx");
    const centery = url.searchParams.get("centery");
    const scale = url.searchParams.get("scale");
    const mapid = url.searchParams.get("MAP_ID");
    let client = "";
    const browser = detect();
    if (browser) {
      //{"name":"chrome","version":"89.0.4389","os":"Windows 10","type":"browser"}
      client = `${browser.type} ${browser.name} ${browser.version} ${browser.os}`;
    }
    // CREATE OBJ TO SEND TO API
    const feedbackItem = {
      education: chkEducation,
      recreation: chkRecreation,
      realEstate: chkRealEstate,
      business: chkBusiness,
      delivery: chkDelivery,
      economicDevelopment: chkEconomicDevelopment,
      rating: rating,
      forBusinessUse: chkRelyOnBusiness,
      comments: `${comments}\n\nClient: ${client}\n\nOrigin:${url}\n\nMap ID:${mapid}`,
      email: email,
      xmin: chkIncludeMapScaleAndExtent ? xmin : 0,
      ymin: chkIncludeMapScaleAndExtent ? ymin : 0,
      xmax: chkIncludeMapScaleAndExtent ? xmax : 0,
      ymax: chkIncludeMapScaleAndExtent ? ymax : 0,
      centerX: chkIncludeMapScaleAndExtent ? centerx : 0,
      centerY: chkIncludeMapScaleAndExtent ? centery : 0,
      scale: chkIncludeMapScaleAndExtent ? scale : 0,
      url: document.referrer,
      contact: "sim-gis@simcoe.ca",
      otherUses: otherUses,
      reportProblem: reportProblem,
      myMapsId: myMapsId || mapid,
      featureId: featureId,
    };

    //if (mapid) feedbackItem["map_id"] = mapid;
    //console.log(JSON.stringify(feedbackItem));
    postData(postUrl, feedbackItem, (response) => {
      setSubmitted(true);
      setFeedbackSubmitting(false);
    });
  };

  const validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const getJSON = (url, callback) => {
    return fetch(url)
      .then((response) => {
        console.log("getJSON", response);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((responseJson) => {
        if (Object.keys(responseJson).length === 0) {
          console.error("Received empty data from the server.");
          if (callback !== undefined) callback();
          return;
        }
        // CALLBACK WITH RESULT
        if (callback !== undefined) callback(responseJson);
        else return responseJson;
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        if (callback !== undefined) callback();
        else return;
      });
  };

  const onCaptcha = (token) => {
    if (token)
      try {
        getJSON(captchaResponseUrl + token, (resp) => {
          if (resp && resp.score < 0.1) setBotDetected(true);
        });
      } catch (e) {
        console.log("Error retrieving catcha score", e);
        setBotDetected(true);
      }
  };

  const postData = (url, data = {}, callback) => {
    // Default options are marked with *
    return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        //'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    }).then((response) => {
      callback(response);
      //return response;
    });
  };

  // handle the case where we don't detect the browser
  return (
    <GoogleReCaptchaProvider reCaptchaKey={key}>
      <GoogleReCaptcha onVerify={(token) => onCaptcha(token)} />
      <div id="main" className={botDetected ? "hidden" : submitted ? "" : "app"}>
        <div className={submitted ? "hidden" : ""}>
          <h1 className="header">{reportProblem ? "Report a Problem" : "Feedback"}</h1>
          <div className={reportProblem ? "hidden" : "intro"}>
            Help improve your online mapping experience. Please provide any feedback you feel is necessary to make your experience better. We read every comment and want to hear from you!
            <br />
          </div>

          <div className="body">
            <div className={reportProblem ? "hidden" : ""}>
              <div className="question">What do you use our interactive maps for?</div>
              <div className="question1-checkboxes">
                <FeedbackCheckbox
                  checked={chkEducation}
                  onChange={(event) => {
                    setChkEducation(event.target.checked);
                  }}
                  label="Education"
                />
                <FeedbackCheckbox
                  checked={chkRecreation}
                  onChange={(event) => {
                    setChkRecreation(event.target.checked);
                  }}
                  label="Recreation"
                />
                <FeedbackCheckbox
                  checked={chkRealEstate}
                  onChange={(event) => {
                    setChkRealEstate(event.target.checked);
                  }}
                  label="Real Estate"
                />
                <FeedbackCheckbox
                  checked={chkBusiness}
                  onChange={(event) => {
                    setChkBusiness(event.target.checked);
                  }}
                  label="Business"
                />
                <FeedbackCheckbox
                  checked={chkDelivery}
                  onChange={(event) => {
                    setChkDelivery(event.target.checked);
                  }}
                  label="Delivery"
                />
                <FeedbackCheckbox
                  checked={chkEconomicDevelopment}
                  onChange={(event) => {
                    setChkEconomicDevelopment(event.target.checked);
                  }}
                  label="Economic Development"
                />
              </div>
              <div className="otheruses-container">
                <label>OTHER:</label>&nbsp;
                <input className={"otheruses"} placeholder="" onChange={onOtherUsesChange} value={otherUses} />
              </div>

              <div className="question">Please rate the usefulness to you or your organization.</div>
              <Ratings rating={rating} widgetRatedColors="blue" changeRating={changeRating} widgetDimensions="35px">
                <Ratings.Widget />
                <Ratings.Widget />
                <Ratings.Widget />
                <Ratings.Widget />
                <Ratings.Widget />
              </Ratings>

              <div className="question">Do you rely on this application for business use?</div>
              <FeedbackCheckbox
                checked={chkRelyOnBusiness}
                onChange={(event) => {
                  setChkRelyOnBusiness(event.target.checked);
                }}
                label="Yes I do rely on this for business use"
              />
            </div>

            <div className="question">If you wish to be contacted regarding your feedback please provide us your email address (optional)</div>
            <input className={emailValid ? "email" : "email red"} placeholder="Enter Optional Email Address Here" onChange={onEmailChange} value={email} />

            <div className="question">{reportProblem ? "Please provide details about the problem you're reporting." : "Please provide us some feedback about your experience."}</div>
            <textarea className="comments" onChange={onCommentsChange} value={comments} />

            <div className={reportProblem ? "hidden" : ""}>
              <FeedbackCheckbox
                checked={chkIncludeMapScaleAndExtent}
                onChange={(event) => {
                  setChkIncludeMapScaleAndExtent(event.target.checked);
                }}
                label="Include my map scale and extent with the feedback"
              />
            </div>

            <div className="question">
              <button className="button blue" style={{ marginRight: "5px", width: "150px" }} onClick={onSendFeedbackButton} disabled={feedbackSubmitting}>
                Send Feedback
              </button>
              <button className="button" style={{ width: "75px" }} onClick={onResetButton}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className={submitted ? "success" : "hidden"}>
          Thank you for the Feedback! <br />
          If you left a question and email, we'll get back to you shortly!
        </div>

        <div className={botDetected ? "bot" : "hidden"}>
          You've been identified as a bot. <br />
          Contact sim-gis@simcoe.ca directly if you're human.
        </div>
      </div>
    </GoogleReCaptchaProvider>
  );
};

export default App;

const FeedbackCheckbox = (props) => {
  return (
    <label>
      <Checkbox checked={props.checked} onChange={props.onChange} />
      <span style={{ marginLeft: 8 }}>{props.label}</span>
    </label>
  );
};
