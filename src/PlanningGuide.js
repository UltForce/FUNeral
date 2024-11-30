import "./PlanningGuide.css"; // Import CSS file for styling
import { useNavigate } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";


const PlanningGuide = () => {
  
  
  const navigate = useNavigate(); // Initialize navigate function
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        const headerOffset = 10; // Adjust this value based on your header height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }
  }, [location]);

  return (
    
    <main className="main-content">
    <section className="planning-guide">
      <div>
        <h1 className="planning-title">PLANNING GUIDE</h1>
        <div className="planning-border"></div>
      </div>
      
    </section>
    <section className="planning-container">
      <div className="planning-decription">
        <p>
        <b className="FUNeral-title">FUNeral</b> can help you book a meeting with <b>J.ROA Funeral Service</b>, where you can discuss your loved one's wishes and any essential cultural or religious customs. Together, we'll navigate the funeral services, ensuring your needs and feelings are prioritized throughout the process.   
        With the help of our chatbot, it is just a click away. We are ready to offer tips on coping with grief and help you explore our resources. Together, we'll ensure that all the logistics are handled carefully, prioritizing your needs and emotions throughout this challenging time. 
        Let's cherish their memory together.
        </p>
      </div>
      <div className="number">
          <a href="#step1">1</a>
          <a href="#step2">2</a>
          <a href="#step3">3</a>
          <a href="#step4">4</a>
          <a href="#step5">5</a>
    </div>
    <div className="steps" id="step1"> 
    <h1>Step 1: Set Appointment</h1>
        <p>
            This is the first and crucial step. During this appointment, discuss the deceased's wishes, cultural or religious considerations, and the selected funeral services. 
            It's also the time to confirm the schedule, including the wake to burial.
        </p>
        <div className="pov-container">
           <div className="for-user">
           <h2 className="label-user">User's Perspective:</h2>
        <ol>
                    <li><strong>Login/Registration:</strong>
                        <ul>
                            <li>Register for an account or log in via email and password.</li>
                            <li>If applicable, login can be simplified using Google for existing users.</li>
                        </ul>
                    </li>
                    <li><strong>Select Service Preferences:</strong>
                        <ul>
                            <li>Navigate to the "Book Appointment" page.</li>
                            <li>Provide details, such as:
                                <ul>
                                    <li>The deceased's name, age, and cause of death.</li>
                                    <li>Preferred wake location (funeral home, residence, or church).</li>
                                    <li>Number of days for the wake (default: 7 days).</li>
                                    <li>Desired date and time of burial.</li>
                                    <li>Additional services (casket type, candles, flower arrangements, etc.).</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li><strong>Submit Appointment:</strong>
                        <ul>
                            <li>Confirm all details.</li>
                            <li>Wait for approval from the funeral manager.</li>
                        </ul>
                    </li>
                    <li><strong>Receive Notification:</strong>
                        <ul>
                            <li>Users are notified (via system and email) if the appointment is approved, rejected, or requires clarification.</li>
                        </ul>
                    </li>
                </ol>
           </div>
           <br/>
           <div className="for-manager">
           <h2 className="label-manager">Funeral Manager's Perspective:</h2>
           <ol className="manager-text">
           
                    <li><strong>Receive Appointment Request:</strong>
                        <ul>
                            <li>Review the appointment request in the system.</li>
                            <li>Validate the requested dates, resources, and requirements.</li>
                        </ul>
                    </li>
                    <li><strong>Approve/Reject Appointment:</strong>
                        <ul>
                            <li>Approve the request if all resources and schedules are available.</li>
                            <li>Communicate clarifications or suggest changes if needed.</li>
                        </ul>
                    </li>
                    <li><strong>Assign Personnel:</strong>
                        <ul>
                            <li>Allocate staff and prepare logistical resources for the event.</li>
                        </ul>
                    </li>
                    <li><strong>Send Confirmation:</strong>
                        <ul>
                            <li>Notify the user about the status of their request via the notification system.</li>
                        </ul>
                    </li>
                
                    
                </ol>
           </div>
        </div>
      
    </div>
    <div className="steps" id="step2"> 
    <h1>Step 2: Settle Payments</h1>
        <p>
        Settling payments is a crucial step in the funeral planning process. 
        Financial considerations can add extra stress during this challenging time, so it's essential to approach the costs of a funeral with as much clarity and support as possible. 
        Prices vary significantly based on your choices, such as the funeral packages and service. As JROA Funeral Service, We can assist you in crafting a package that respects your budget and honors your loved one's memory. 
        </p>
        <div className="pov-container">
           <div className="for-user">
           <h2 className="label-user">User's Perspective:</h2>
        <ol>
                    <li><strong>Receive Invoice:</strong>
                        <ul>
                            <li>Access the detailed invoice for the chosen services and products.</li>
                        </ul>
                    </li>
                    <li><strong>Make Payment:</strong>
                        <ul>
                            <li>Navigate to the "Book Appointment" page.</li>
                            <li>Pay a deposit upfront, with the remaining balance settled before the burial.</li>

                        </ul>
                    </li>
                    <li><strong>Obtain Receipt:</strong>
                        <ul>
                            <li>Download or receive the payment receipt for record-keeping.</li>
                        </ul>
                    </li>
                </ol>
           </div>
           <br/>
           <div className="for-manager">
           <h2 className="label-manager">Funeral Manager's Perspective:</h2>
           <ol className="manager-text">
           
                      <li><strong>Generate Invoice:</strong>
                        <ul>
                            <li>Provide details, such as:
                                <ul>
                                    <li>Casket type and costs.</li>
                                    <li>Additional service fees (flower arrangements, curtains, etc.).</li>
                                    <li>Burial permits and logistics costs.</li>
                                    <li>Venue setup costs.</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li><strong>Verify Payment:</strong>
                        <ul>
                            <li>Confirm the user's payment through the system.</li>
                            <li>Mark the transaction as "Paid" or "Pending" (if partial payment is made).</li>
                        </ul>
                    </li>
                    <li><strong>Issue Receipt:</strong>
                        <ul>
                            <li>Automatically generate a receipt after payment confirmation.</li>
                        </ul>
                    </li>
                
                </ol>
           </div>
        </div>
      
    </div>
    <div className="steps" id="step3"> 
    <h1>Step 3: 7 Days Wake</h1>
        <p>
        The wake is a profoundly personal tradition that brings family and friends together to celebrate the life of your loved one. 
        Typically lasting seven days, this period provides a sanctuary for communal mourning, healing, and remembrance. 
        </p>
        <div className="pov-container">
           <div className="for-user">
           <h2 className="label-user">User's Perspective:</h2>
        <ol>
                    <li><strong>Coordinate Setup:</strong>
                        <ul>
                            <li>Work with the funeral manager to finalize wake arrangements:
                                <ul>
                                    <li>Decoration themes.</li>
                                    <li>Viewing Address.</li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li><strong>Invite Guests:</strong>
                        <ul>
                            <li>Share the wake location and schedule with friends and relatives.</li>
                           
                        </ul>
                    </li>
                    <li><strong>View Wake Progress:</strong>
                        <ul>
                            <li>Use the app to track preparations, including photo updates.</li>
                        </ul>
                    </li>
                    <li><strong>Attend Wake:</strong>
                        <ul>
                            <li>Attend the wake and oversee guest arrivals, religious services, and nightly prayers.</li>
                        </ul>
                    </li>
                </ol>
           </div>
           <br/>
           <div className="for-manager">
           <h2 className="label-manager">Funeral Manager's Perspective:</h2>
           <ol className="manager-text">
           
                    <li><strong>Prepare Venue:</strong>
                        <ul>
                            <li>Decorate the venue with flowers, candles, and curtains.</li>
                            <li>Arrange seating, lighting, and a stand for the deceased's portrait.</li>
                        </ul>
                    </li>
                    <li><strong>Supervise Wake Operations:</strong>
                        <ul>
                            <li>Ensure the arrangement and functionality of the venue.</li>
                            <li>Provide additional support to users as requested.</li>
                        </ul>
                    </li>
                    <li><strong>Daily Check-In:</strong>
                        <ul>
                            <li>Send daily updates to the family through the app, including guest counts and event notes.</li>
                        </ul>
                    </li>
                </ol>
           </div>
        </div>
      
    </div>
    <div className="steps" id="step4"> 
    <h1>Step 4: Burial Session</h1>
        <p>
        The burial session is a solemn occasion for a final farewell. This significant event may include prayers, eulogies, and 
        traditions that reflect the family's faith or cultural background, whether it takes place at a cemetery or a unique location.
        </p>
        <div className="pov-container">
           <div className="for-user">
           <h2 className="label-user">User's Perspective:</h2>
        <ol>
                    <li><strong>Confirm Burial Details:</strong>
                        <ul>
                            <li>Confirm the burial location, time, and transportation arrangements.</li>
                           
                        </ul>
                    </li>
                    <li><strong>Coordinate with Guests:</strong>
                        <ul>
                            <li>Inform relatives and friends about the final schedule.</li>
                            
                        </ul>
                    </li>
                    <li><strong>Attend the Burial Ceremony:</strong>
                        <ul>
                            <li>Join the convoy from the wake venue to the cemetery.</li>
                            <li>Perform cultural and religious practices.</li>
                        </ul>
                    </li>
                    <li><strong>Receive Notification:</strong>
                        <ul>
                            <li>Users are notified (via system and email) if the appointment is approved, rejected, or requires clarification.</li>
                        </ul>
                    </li>
                </ol>
           </div>
           <br/>
           <div className="for-manager">
           <h2 className="label-manager">Funeral Manager's Perspective:</h2>
           <ol className="manager-text">
           
                    <li><strong>Conclude Wake:</strong>
                        <ul>
                            <li>Gather the materials and clean up the location after the wake.</li>
                   
                        </ul>
                    </li>
                    <li><strong>Prepare for Burial:</strong>
                        <ul>
                            <li>Arrange the hearse and convoy vehicles.</li>
                            <li>Coordinate with cemetery staff for burial preparation.</li>
                        </ul>
                    </li>
                    <li><strong>Conduct Burial Session:</strong>
                        <ul>
                            <li>Supervise the burial ceremony.</li>
                            <li>Provide necessary tools for cultural rites, such as flowers and candles.</li>
                        </ul>
                    </li>
                   
                </ol>
           </div>
        </div>
      
    </div>
    <div className="steps" id="step5"> 
    <h1>Step 5: Honoring Grief</h1>
        <p>
        The process of grieving continues well beyond the burial, and recognizing 
        your feelings of loss is an essential part of healing. This step encourages you to create space for remembrance and reflection, celebrating the lived life while acknowledging the sorrow. 
        </p>
        <div className="pov-container">
           <div className="for-user">
           <h2 className="label-user">User's Perspective:</h2>
        <ol>
                    <li><strong>Leave Reviews:</strong>
                        <ul>
                            <li>Submit reviews for services and products used.</li>
                            <li>Provide feedback on the overall experience.</li>
                        </ul>
                    </li>
                    
                </ol>
           </div>
           <br/>
           <div className="for-manager">
           <h2 className="label-manager">Funeral Manager's Perspective:</h2>
           <ol className="manager-text">
           
                    <li><strong>Archive Records:</strong>
                        <ul>
                            <li>RArchive the appointment and transaction details for future reference.</li>
                           </ul>
                    </li>
                    <li><strong>Follow-Up:</strong>
                        <ul>
                            <li>Send a "Thank You" note to the bereaved family.</li>
                            <li>Offer additional grief support resources or services.</li>
                        </ul>
                    </li>
                    <li><strong>Track Feedback:</strong>
                        <ul>
                            <li>Monitor user reviews and improve services based on feedback.</li>
                        </ul>
                    </li>
                  
                </ol>
           </div>
        </div>
      
    </div>
    </section>
    </main>
  );
};

export default PlanningGuide;
