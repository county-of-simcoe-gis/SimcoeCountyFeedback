import React from "react";
import "./App.css";
import Checkbox from "./Checkbox";
import Ratings from "react-ratings-declarative";
import { GoogleReCaptchaProvider, GoogleReCaptcha } from "react-google-recaptcha-v3";
import config from "./config.json";

const postUrl = config.postUrl;
const getUrl = config.getUrl;

// RECAPTCHA DETAILS DEV
// const key = config.devCaptchaKey; // DEV
// const captchaResponseUrl = config.devCaptchaResponseUrl;

// RECAPTCHA DETAILS PRODUCTION
const key = config.productionCaptchaKey;
const captchaResponseUrl = config.productionCaptchaResponseUrl;

class App extends React.Component {
  state = {
    chkEducation: false,
    chkRecreation: false,
    chkRealEstate: false,
    chkBusiness: false,
    chkDelivery: false,
    chkEconomicDevelopment: false,
    chkRelyOnBusiness: false,
    chkIncludeMapScaleAndExtent: true,
    submitSuccess: false,
    rating: 2.5,
    email: "",
    emailValid: true,
    comments: "",
    submitted: false,
    otherUses: "",
    botDetected: false
  };

  componentDidMount() {
    // HANDLE URL PARAMETERS (ADVANCED)
    const url = new URL(window.location.href);
    const id = url.searchParams.get("ID");
    if (id !== null) {
      this.getJSON(getUrl + id, result => {
        this.setState({
          chkEducation: result.education ? result.education : false,
          chkRecreation: result.recreation ? result.recreation : false,
          chkRealEstate: result.real_estate ? result.real_estate : false,
          chkBusiness: result.business ? result.business : false,
          chkDelivery: result.delivery ? result.delivery : false,
          chkEconomicDevelopment: result.economic_development ? result.economic_development : false,
          chkRelyOnBusiness: result.for_business_use ? result.for_business_use : false,
          rating: result.rating,
          email: result.email ? result.email : "",
          comments: result.comments ? result.comments : "",
          otherUses: result.other_uses ? result.other_uses : ""
        });
      });
    }
  }

  //STARS
  changeRating = (newRating, name) => {
    this.setState({
      rating: newRating
    });
  };

  onResetButton = () => {
    this.setState({
      chkEducation: false,
      chkRecreation: false,
      chkRealEstate: false,
      chkBusiness: false,
      chkDelivery: false,
      chkEconomicDevelopment: false,
      chkRelyOnBusiness: false,
      chkIncludeMapScaleAndExtent: true,
      rating: 2,
      emailValid: true
    });
  };

  onEmailChange = evt => {
    this.setState({ email: evt.target.value });
  };

  onOtherUsesChange = evt => {
    this.setState({ otherUses: evt.target.value });
  };

  onCommentsChange = evt => {
    this.setState({ comments: evt.target.value });
  };

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  onSendFeedbackButton = () => {
    // GET CHECKBOX ANSWERS
    let usage = [];
    if (this.state.chkEducation) usage.push("Education");
    if (this.state.chkRecreation) usage.push("Recreation");
    if (this.state.chkRealEstate) usage.push("Real Estate");
    if (this.state.chkBusiness) usage.push("Business");
    if (this.state.chkDelivery) usage.push("Delivery");
    if (this.state.chkEconomicDevelopment) usage.push("Economic Development");

    // GET URL PARAMETERS
    const url = new URL(window.location.href);
    const xmin = url.searchParams.get("xmin");
    const xmax = url.searchParams.get("xmax");
    const ymin = url.searchParams.get("ymin");
    const ymax = url.searchParams.get("ymax");
    const centerx = url.searchParams.get("centerx");
    const centery = url.searchParams.get("centery");
    const scale = url.searchParams.get("scale");

    // CREATE OBJ TO SEND TO API
    const feedbackItem = {
      education: this.state.chkEducation,
      recreation: this.state.chkRecreation,
      realEstate: this.state.chkRealEstate,
      business: this.state.chkBusiness,
      delivery: this.state.chkDelivery,
      economicDevelopment: this.state.chkEconomicDevelopment,
      rating: this.state.rating,
      forBusinessUse: this.state.chkRelyOnBusiness,
      comments: this.state.comments.replace(/\n/g, "<br />"),
      email: this.state.email,
      xmin: this.state.chkIncludeMapScaleAndExtent ? xmin : 0,
      ymin: this.state.chkIncludeMapScaleAndExtent ? ymin : 0,
      xmax: this.state.chkIncludeMapScaleAndExtent ? xmax : 0,
      ymax: this.state.chkIncludeMapScaleAndExtent ? ymax : 0,
      centerX: this.state.chkIncludeMapScaleAndExtent ? centerx : 0,
      centerY: this.state.chkIncludeMapScaleAndExtent ? centery : 0,
      scale: this.state.chkIncludeMapScaleAndExtent ? scale : 0,
      url: document.referrer,
      contact: "sim-gis@simcoe.ca",
      otherUses: this.state.otherUses
    };

    console.log(feedbackItem);
    this.postData(postUrl, feedbackItem);

    // HIDE MAIN PAGE
    setTimeout(() => {
      this.setState({ submitted: true });
    }, 500);
  };

  getJSON(url, callback) {
    return fetch(url)
      .then(response => response.json())
      .then(responseJson => {
        // CALLBACK WITH RESULT
        if (callback !== undefined) callback(responseJson);
      })
      .catch(error => {
        console.error(error);
      });
  }

  onCaptcha(token) {
    this.getJSON(captchaResponseUrl + token, resp => {
      if (resp.score < 0.1) this.setState({ botDetected: true });
    });
  }

  async postData(url, data = {}) {
    // Default options are marked with *
    return fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, cors, *same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json"
        //'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrer: "no-referrer", // no-referrer, *client
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    }).then(response => {
      return response;
    });
  }

  //<GoogleReCaptchaProvider reCaptchaKey={window.location.hostname === "localhost" ? devKey : productionKey}>
  render() {
    return (
      <GoogleReCaptchaProvider reCaptchaKey={key}>
        <GoogleReCaptcha onVerify={token => this.onCaptcha(token)} />
        <div id="main" className={this.state.botDetected ? "hidden" : this.state.submitted ? "" : "app"}>
          <div className={this.state.submitted ? "hidden" : ""}>
            <h1 className="header">Feedback</h1>
            <div className="intro">
              Help improve your online mapping experience. Please provide any feedback you feel is necessary to make your experience better. We read every comment and want to hear from you!<br />
            </div>

            <div className="body">
              <div className="question">What do you use our interactive maps for?</div>
              <div className="question1-checkboxes">
                <FeedbackCheckbox
                  checked={this.state.chkEducation}
                  onChange={event => {
                    this.setState({ chkEducation: event.target.checked });
                  }}
                  label="Education"
                />
                <FeedbackCheckbox
                  checked={this.state.chkRecreation}
                  onChange={event => {
                    this.setState({ chkRecreation: event.target.checked });
                  }}
                  label="Recreation"
                />
                <FeedbackCheckbox
                  checked={this.state.chkRealEstate}
                  onChange={event => {
                    this.setState({ chkRealEstate: event.target.checked });
                  }}
                  label="Real Estate"
                />
                <FeedbackCheckbox
                  checked={this.state.chkBusiness}
                  onChange={event => {
                    this.setState({ chkBusiness: event.target.checked });
                  }}
                  label="Business"
                />
                <FeedbackCheckbox
                  checked={this.state.chkDelivery}
                  onChange={event => {
                    this.setState({ chkDelivery: event.target.checked });
                  }}
                  label="Delivery"
                />
                <FeedbackCheckbox
                  checked={this.state.chkEconomicDevelopment}
                  onChange={event => {
                    this.setState({ chkEconomicDevelopment: event.target.checked });
                  }}
                  label="Economic Development"
                />
              </div>
              <div className="otheruses-container">
                <label>OTHER:</label>&nbsp;<input className={"otheruses"} placeholder="" onChange={this.onOtherUsesChange} value={this.state.otherUses} />
              </div>

              <div className="question">Please rate the usefulness to you or your organization.</div>
              <Ratings rating={this.state.rating} widgetRatedColors="blue" changeRating={this.changeRating} widgetDimensions="35px">
                <Ratings.Widget />
                <Ratings.Widget />
                <Ratings.Widget />
                <Ratings.Widget />
                <Ratings.Widget />
              </Ratings>

              <div className="question">Do you rely on this application for business use?</div>
              <FeedbackCheckbox
                checked={this.state.chkRelyOnBusiness}
                onChange={event => {
                  this.setState({ chkRelyOnBusiness: event.target.checked });
                }}
                label="Yes I do rely on this for business use"
              />

              <div className="question">If you wish to be contacted regarding your feedback please provide us your email address (optional)</div>
              <input className={this.state.emailValid ? "email" : "email red"} placeholder="Enter Optional Email Address Here" onChange={this.onEmailChange} value={this.state.email} />

              <div className="question">Please provide us some feedback about your experience.</div>
              <textarea className="comments" onChange={this.onCommentsChange} value={this.state.comments} />

              <div>
                <FeedbackCheckbox
                  checked={this.state.chkIncludeMapScaleAndExtent}
                  onChange={event => {
                    this.setState({ chkIncludeMapScaleAndExtent: event.target.checked });
                  }}
                  label="Include my map scale and extent with the feedback"
                />
              </div>

              <div className="question">
                <button className="button blue" style={{ marginRight: "5px", width: "150px" }} onClick={this.onSendFeedbackButton}>
                  Send Feedback
                </button>
                <button className="button" style={{ width: "75px" }} onClick={this.onResetButton}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className={this.state.submitted ? "success" : "hidden"}>
            Thank you for the Feedback! <br />If you left a question and email, we'll get back to you shortly!
          </div>

          <div className={this.state.botDetected ? "bot" : "hidden"}>
            You've been identified as a bot. <br />Contact sim-gis@simcoe.ca directly if you're human.
          </div>
        </div>
      </GoogleReCaptchaProvider>
    );
  }
}

export default App;

const FeedbackCheckbox = props => {
  return (
    <label>
      <Checkbox checked={props.checked} onChange={props.onChange} />
      <span style={{ marginLeft: 8 }}>{props.label}</span>
    </label>
  );
};
