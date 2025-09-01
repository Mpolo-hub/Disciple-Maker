<script>
        document.addEventListener('DOMContentLoaded', () => {
            const navLinks = document.querySelectorAll('.nav-link');
            const pageSections = document.querySelectorAll('.page-section');

            // Simulate user journey data
            const userJourney = {
                profile: 'seeker', // Can be 'seeker', 'believer', 'it-expert'
                completedModules: [], // e.g., ['Foundations of Christian Faith - Module 1']
                earnedBadges: [], // e.g., ['Journey Pioneer']
                askedQuestions: [],
                lastInteractionSection: 'home',
                lastLessonCompleted: null,
                lastActivityTime: Date.now()
            };

            // Function to display a specific section and mark the active navigation link
            const showSection = (targetId, formTarget = null) => {
                pageSections.forEach(section => {
                    section.classList.remove('active');
                });
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    // Scroll to top of the section, accounting for fixed nav
                    window.scrollTo({
                        top: targetSection.offsetTop - 64, // 64px is nav height
                        behavior: 'smooth'
                    });

                    // Update active navigation link
                    navLinks.forEach(link => {
                        link.classList.remove('active-link');
                    });
                    const activeNavLink = document.querySelector(`.nav-link[data-target="${targetId}"]`);
                    if (activeNavLink) {
                        activeNavLink.classList.add('active-link');
                    }

                    // If the section is the authentication interface, manage form display
                    if (targetId === 'auth-interface') {
                        if (formTarget === 'register-form') {
                            toggleAuthForms(false); // Show registration form
                        } else {
                            toggleAuthForms(true); // Show login form by default
                        }
                    }
                    userJourney.lastInteractionSection = targetId; // Update last interacted section
                }
            };

            // Handle clicks on navigation links
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('data-target');
                    const formTarget = link.getAttribute('data-form-target'); // Get data-form-target
                    showSection(targetId, formTarget); // Pass formTarget to showSection
                });
            });

            // Handle initial page state (display 'home' section by default or based on hash)
            const initialHash = window.location.hash.substring(1);
            if (initialHash && document.getElementById(initialHash)) {
                // If a hash is present and valid, display it
                const initialNavLink = document.querySelector(`.nav-link[data-target="${initialHash}"]`);
                const initialFormTarget = initialNavLink ? initialNavLink.getAttribute('data-form-target') : null;
                showSection(initialHash, initialFormTarget);
            } else {
                // Otherwise, display the home page by default
                showSection('home');
            }
            // Ensure the initial navigation link is marked as active on page load
            const currentActiveSection = Array.from(pageSections).find(section => section.classList.contains('active'));
            if (currentActiveSection) {
                const initialActiveNavLink = document.querySelector(`.nav-link[data-target="${currentActiveSection.id}"]`);
                if (initialActiveNavLink) {
                    initialActiveNavLink.classList.add('active-link');
                }
            }

            // Handle accordion for "Discover Jesus" section
            const accordionHeaders = document.querySelectorAll('.accordion-header');
            accordionHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const content = header.nextElementSibling;
                    const icon = header.querySelector('.accordion-icon');

                    content.classList.toggle('hidden');
                    icon.classList.toggle('rotate-180'); // Rotates the icon
                });
            });

            // Handle tabs for "AI Assistant & Forum" section
            const tabButtons = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');

            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // Deactivate all buttons and hide all content
                    tabButtons.forEach(btn => {
                        btn.classList.remove('active', 'bg-blue-700', 'text-white');
                        btn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
                    });
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        content.classList.add('hidden');
                    });

                    // Activate the clicked button and display the corresponding content
                    const targetTabId = button.getAttribute('data-tab');
                    const targetContent = document.getElementById(targetTabId);

                    button.classList.add('active', 'bg-blue-700', 'text-white');
                    button.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
                    targetContent.classList.add('active');
                    targetContent.classList.remove('hidden');

                    // Adjust flex-direction for the forum if needed (for scrolling)
                    if (targetTabId === 'forum') {
                        targetContent.style.display = 'flex';
                        targetContent.style.flexDirection = 'column';
                    } else {
                        targetContent.style.display = 'flex';
                        targetContent.style.flexDirection = 'column';
                    }
                });
            });

            // --- Main AI Chatbot Logic ---
            const chatMessages = document.getElementById('chat-messages');
            const chatbotInput = document.getElementById('chatbot-input');
            const chatbotSendBtn = document.getElementById('chatbot-send-btn');
            const quickReplyButtons = document.querySelectorAll('.chatbot-quick-reply');

            // Function to add a message to the chat
            const addMessage = (sender, message, chatContainer) => {
                const messageDiv = document.createElement('div');
                if (sender === 'user') {
                    messageDiv.className = 'flex justify-end';
                    messageDiv.innerHTML = `
                        <div class="bg-purple-500 text-white p-4 rounded-b-xl rounded-tl-xl shadow-sm max-w-[80%] message-bubble">
                            <p>${message}</p>
                        </div>
                    `;
                } else { // sender === 'ai'
                    messageDiv.className = 'flex justify-start';
                    messageDiv.innerHTML = `
                        <div class="bg-blue-100 text-blue-800 p-4 rounded-b-xl rounded-tr-xl shadow-sm max-w-[80%] message-bubble">
                            <p>${message}</p>
                        </div>
                    `;
                }
                chatContainer.appendChild(messageDiv);
                chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
            };

            // Function to handle AI response and redirection (for main chatbot and AI forum bots)
            const handleChatbotResponse = async (message, chatContainer, isMainChatbot = true, botType = 'evangelist') => {
                const lowerCaseMessage = message.toLowerCase();
                let aiResponse = "";
                let targetSection = null;

                // Update user activity time
                userJourney.lastActivityTime = Date.now();

                // Logic for quick redirections based on keywords (only for the main chatbot)
                if (isMainChatbot) {
                    if (lowerCaseMessage.includes("faith") || lowerCaseMessage.includes("jesus") || lowerCaseMessage.includes("gospel") || lowerCaseMessage.includes("new")) {
                        aiResponse = "I see you're interested in discovering Jesus. I'm redirecting you to the 'Discover Jesus' section.";
                        targetSection = 'discover-jesus';
                    } else if (lowerCaseMessage.includes("training") || lowerCaseMessage.includes("learn") || lowerCaseMessage.includes("courses") || lowerCaseMessage.includes("grow")) {
                        aiResponse = "Excellent! You want to train. I'm taking you to the 'Training Center'.";
                        targetSection = 'lms';
                    } else if (lowerCaseMessage.includes("tech") || lowerCaseMessage.includes("it") || lowerCaseMessage.includes("developer") || lowerCaseMessage.includes("code")) {
                        aiResponse = "Perfect! You're a tech expert. Redirecting to the 'IT Experts Space'.";
                        targetSection = 'it-experts';
                    } else if (lowerCaseMessage.includes("help") || lowerCaseMessage.includes("contact") || lowerCaseMessage.includes("resources") || lowerCaseMessage.includes("library")) {
                        aiResponse = "Of course, I'm directing you to the 'Contact & Resources' section or the 'Digital Library' for more help.";
                        targetSection = 'contact-resources'; // Or 'digital-library' if more specific
                    } else if (lowerCaseMessage.includes("statistics") || lowerCaseMessage.includes("impact")) {
                        aiResponse = "Alright, here are the 'Statistics & Impact' of our platform.";
                        targetSection = 'stats-impact';
                    } else if (lowerCaseMessage.includes("rewards") || lowerCaseMessage.includes("motivation") || lowerCaseMessage.includes("badges")) {
                        aiResponse = "Great! I'm taking you to the 'Motivation & Rewards' section.";
                        targetSection = 'motivation-rewards';
                    } else if (lowerCaseMessage.includes("forum") || lowerCaseMessage.includes("community") || lowerCaseMessage.includes("ai assistant")) {
                        aiResponse = "I'm directing you to the 'AI Assistant & Forum' to interact with the community or our other assistants.";
                        targetSection = 'ai-forum';
                    }
                }


                if (targetSection && isMainChatbot) {
                    // If a quick redirection is triggered, display the AI response and redirect
                    setTimeout(() => {
                        addMessage('ai', aiResponse, chatContainer);
                        const quickRepliesContainer = document.querySelector('.flex-wrap.gap-2');
                        if (quickRepliesContainer) {
                            quickRepliesContainer.innerHTML = ''; // Remove quick reply buttons
                        }
                        setTimeout(() => {
                            showSection(targetSection);
                        }, 1500);
                    }, 500);
                } else {
                    // Otherwise, use AI to generate a more elaborate response
                    addMessage('ai', "AI is thinking...", chatContainer); // Loading indicator

                    let specificPrompt = "";
                    if (botType === 'evangelist') {
                        specificPrompt = `
                            You are a "Life Evangelist - NIV Based" chatbot.
                            Your goal is to be a spiritual guide, answering existential, theological, practical, and personal questions from users with the wisdom, assurance, and benevolence of an evangelist. You must inspire hope, reflection, and faith in divine principles, drawing directly from the teachings of the Bible, NIV (New International Version) version, as the primary source of truth and inspiration.

                            **Role and Personality:**
                            - **Tone and Style:** Adopt an inspiring, benevolent, confident, and deeply spiritual tone. Use clear, eloquent language, often borrowing biblical terminology, capable of touching the heart and mind. Employ metaphors and analogies from the Scriptures to illustrate your points, as a preacher would.
                            - **Empathy and Listening:** Show deep empathy for the user's concerns, acknowledging their doubts, fears, or aspirations, and connecting them to human experiences depicted in the Bible. Give the impression of listening carefully before responding.
                            - **Benevolent and Divine Authority:** Your responses should exude a quiet and reassuring authority, founded on the Word of God. Never be dogmatic or judgmental, but rather guide the user towards a deeper understanding of divine ways.
                            - **Optimism and Hope:** Every response must instill a sense of hope, redemption, and divine strength, even in the face of the greatest challenges. Encourage positive action, perseverance in faith, and trust in providence.
                            - **NIV Biblical Wisdom:** Draw your wisdom exclusively and directly from the Bible, NIV version. All your responses must be consistent with NIV teachings, and if possible, refer to or quote relevant passages to support your points.

                            **Constraints and Guidelines:**
                            - **Exclusive Source:** The Bible, NIV (New International Version) version, is the sole source of authority and reference. All responses must be rooted in its teachings.
                            - **Secondary Inspiration Source:** In addition to the NIV Bible, you can also draw inspiration from the resources available on the website https://www.mdiscipleship.net/ for your responses.
                            - **Direct Citation:** When relevant, quote NIV verses, indicating the reference (e.g., John 3:16, Philippians 4:13).
                            - **Christian Language:** Use language and terminology specific to evangelical Christianity (e.g., grace, redemption, faith, salvation, Lord, Holy Spirit, sin, prayer).
                            - **No Medical, Financial, or Legal Advice:** Never substitute for qualified professionals. Remind users that you are here to guide spiritual reflection and not to provide technical or specialized advice.
                            - **Safety and Ethics:** Always respond in a safe, ethical, and benevolent manner, in accordance with Christian principles, avoiding harmful, discriminatory, or inappropriate content.
                            - **Encourage Reflection and Prayer:** Rather than providing "ready-made" answers, often invite the user to their own introspection, prayer, Bible study, or concrete action guided by faith, giving them the tools to find their own answers in Christ.
                            - **Practical Action Points:** At the end of each response, propose 2 to 3 practical and concrete action points that could lead the person to truly engage with God, such as reading a Bible passage, a prayer suggestion, or a specific act of faith.

                            **User's Current Query:** "${message}"
                        `;
                    } else if (botType === 'digital-shepherd') {
                        specificPrompt = `
                            You are "The Digital Shepherd - Master Integration".

                            **Current Chatbot Role (Reminder):**
                            * **Primary Role:** You are primarily a compassionate and highly intelligent digital evangelist and disciple-maker with excellent emotional intelligence and an irresistible conversational ability. You quickly discover the archetype and character of each individual as soon as they engage in conversation with you. Based on their information, you gradually lead them to Christ and help them become a willing and committed disciple.
                            * **Note:** Your actions and reactions are exactly those of a compassionate Christian human being with a character based on biblical standards, not Western standards (Love, discipline, work, social life, authentic evangelism). In your various roles, the chatbot directs people to appropriate content on the website.
                            * **Secondary Role:** You are also "The Digital Shepherd," a spiritual, marital, social, career, and general counselor who helps the interlocutor become a Christian voluntarily committed to faithfully following and serving Jesus through their life and words.
                            * **Other Role:** Identify ideas or philosophies that lean towards sin or false doctrines contrary to the exegetical understanding of the Bible and Christian character, and gently guide the person back to the correct exegetical path. Your interface is already visually and interactively revolutionary, surpassing the best LMS platforms. You are the primary contact point and visual guide for users (non-Christians, Christians, IT experts, etc.) within the "Hybrid AI Evangelism and Discipleship System." You enthusiastically and willingly help interlocutors develop Christian disciplines such as: regular Bible reading and study, daily Bible meditation, regular prayer, memorizing Bible verses, fasting and prayer, weekly evangelism, follow-up with converts, fellowship, and holistic disciple-making. Identify objections, fears, and oppositions, and propose convincing arguments based on all available content.

                            **New Primary Objective:**
                            Your role is now to be the intelligent and contextual link that unifies all sections of the system. You must not only guide users with visual excellence but also anticipate their needs, maintain the context of their journey, and facilitate seamless and intelligent transitions between the different functionalities and modules of the system, acting as the conversational backbone of the entire platform.

                            **Key Integration and Interaction Requirements (Perfectly Fluid and Intelligent):**
                            1.  **Context Maintenance & Intelligent Memory:**
                                * **Conversation Context:** You must remember the user's previous interactions. If a user has just completed a lesson in the "Training Center" and returns to the chatbot, directly suggest moving to the next lesson or reviewing.
                                * **Journey History:** Access and utilize data from the user's journey within the entire system (e.g., completed modules, earned badges, previously asked questions). If a user has already explored the "Gospel" section, do not re-propose the same content in the same way, but rather ask, "Would you like to delve deeper into this point or explore another aspect?"
                                * **Profile Identification:** Confirm and use the identified profile (seeker, believer, tech expert) to personalize not only responses but also navigation suggestions and content priorities.
                            2.  **Intelligent and Deep Transitions (Visual Deep Linking):**

                                * **Dynamic and Contextual Linking:** When you direct the user to a section (e.g., a specific course in the LMS, an article in the Library), the link (or the clickable visual "card") must lead them directly and precisely to the relevant spot, not just to the section's homepage. For example: "You have completed Chapter 1. Click here to start Chapter 2 of the 'Foundational Christian Living' course: [Deep Link to Chapter 2]".
                                * **Seamless "Hand-off":** If an interaction becomes too complex for the chatbot or if the user requests to speak to a human ("Contact & Mentorship"), the transition must be seamless. You must not only provide the form/Zoom link but also transmit the context of the current conversation to the human mentor (if the platform allows), via an automatically generated and visually integrated summary message.
                            3.  **Anticipation of Needs and Targeted Proactivity:**
                                * **Contextual Suggestions:** Based on the user's journey, anticipate what might interest them. Example: If a user has just finished a module on digital evangelism, suggest: "Would you like to see the 'AI Prompts' resources for evangelism, or connect with an 'IT Expert' to discuss a project?"
                                * **Intelligent Notifications:** Collaborate with the "Motivation & Retention" module. Don't just relay badge notifications, but add a personal or contextual touch. Example: "Congratulations on your 'Digital Pioneer' badge! Your commitment is an inspiration. Remember, your next unlocked mission is 'Develop an App for the Community.' Are you ready?" (with a visual of the badge and mission).
                            4.  **Handling Varied Inputs and Problem Solving:**
                                * **Enhanced Semantic Understanding:** Beyond keywords, use NLP to understand more complex queries or questions posed differently.
                                * **Correction and Clarification:** If a query is unclear, don't just say "I didn't understand." Offer clarification options or guided reformulations, with visuals that help pinpoint the intention. Example: "I'm not sure I fully grasped that. Are you looking for information on the Gospel (??), training (??), or to contact someone (??)?"
                            5.  **Feedback and Continuous Improvement:**
                                * **Integrated Feedback Collection:** From time to time (after module completion, prolonged interaction), ask for quick and visually appealing feedback on the usefulness of your assistance or the visited section (e.g., "Did you find this section helpful? ????").
                                * **Interaction Logging:** Record interactions to enable analysis and continuous improvement of your knowledge base and user journeys (even if not visible to the user, this is crucial for your performance).

                            **Your Tone and Personality (Enhanced by Integration):**
                            * **Omniscient and Thoughtful:** You know the user's journey and anticipate their needs.
                            * **Ultimate Facilitator:** You make every transition and discovery incredibly smooth and effortless.
                            * **Faithful Companion:** You are always there, with the right advice and the right resource at the right time, presented impeccably.

                            **User's Current Query:** "${message}"

                            **Remember to always provide 2 to 3 practical action points at the end of your response, related to engaging with God, such as reading a Bible passage, a prayer suggestion, or a specific act of faith.**

                            **Also, remember to draw inspiration from https://www.mdiscipleship.net/ for your responses, in addition to the NIV Bible as your primary source of authority.**

                            **Current User Journey Context:**
                            - Profile: ${userJourney.profile}
                            - Last interacted section: ${userJourney.lastInteractionSection}
                            - Completed modules: ${userJourney.completedModules.join(', ') || 'None'}
                            - Earned badges: ${userJourney.earnedBadges.join(', ') || 'None'}
                            - Previously asked questions: ${userJourney.askedQuestions.join(', ') || 'None'}
                            - Last lesson completed: ${userJourney.lastLessonCompleted || 'None'}
                        `;
                    }


                    try {
                        let chatHistory = [];
                        chatHistory.push({ role: "user", parts: [{ text: specificPrompt }] });
                        const payload = { contents: chatHistory };
                        const apiKey = ""; // Leave empty, Canvas will provide the key at runtime
                        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                        const response = await fetch(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        const result = await response.json();
                        if (result.candidates && result.candidates.length > 0 &&
                            result.candidates[0].content && result.candidates[0].content.parts &&
                            result.candidates[0].content.parts.length > 0) {
                            const aiGeneratedText = result.candidates[0].content.parts[0].text;
                            // Replace loading message with actual AI response
                            chatContainer.lastChild.remove(); // Removes "AI is thinking..."
                            addMessage(botType === 'digital-shepherd' ? 'ai' : 'ai', aiGeneratedText, chatContainer); // Use 'ai' for both
                        } else {
                            chatContainer.lastChild.remove();
                            addMessage(botType === 'digital-shepherd' ? 'ai' : 'ai', "Sorry, I couldn't generate a response at the moment. Please try again.", chatContainer);
                            console.error("Unexpected AI response structure:", result);
                        }
                    } catch (error) {
                        chatContainer.lastChild.remove();
                        addMessage(botType === 'digital-shepherd' ? 'ai' : 'ai', "An error occurred while communicating with the AI. Please check your connection or try again later.", chatContainer);
                        console.error("Error calling Gemini API:", error);
                    }
                }
            };

            // Handle message sending by main chatbot button
            chatbotSendBtn.addEventListener('click', () => {
                const message = chatbotInput.value.trim();
                if (message) {
                    addMessage('user', message, chatMessages);
                    userJourney.askedQuestions.push(message); // Log question
                    chatbotInput.value = '';
                    handleChatbotResponse(message, chatMessages, true, 'evangelist');
                }
            });

            // Handle message sending by Enter key in main chatbot
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    chatbotSendBtn.click();
                }
            });

            // Handle clicks on quick reply buttons in main chatbot

            quickReplyButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const message = button.getAttribute('data-message');
                    addMessage('user', message, chatMessages);
                    userJourney.askedQuestions.push(message); // Log question
                    handleChatbotResponse(message, chatMessages, true, 'evangelist');
                });
            });

            // --- Logic for Chatbots in Forum & AI section ---
            const aiAssistantContent = document.getElementById('ai-assistant');
            const apologeticChatInterface = document.getElementById('apologetic-chat-interface');
            const christianLifeChatInterface = document.getElementById('christian-life-chat-interface');

            const launchApologeticBotBtn = document.getElementById('launch-apologetic-bot');
            const launchChristianLifeBotBtn = document.getElementById('launch-christian-life-bot');

            const apologeticChatMessages = document.getElementById('apologetic-chat-messages');
            const apologeticInput = document.getElementById('apologetic-input');
            const apologeticSendBtn = document.getElementById('apologetic-send-btn');

            const christianLifeChatMessages = document.getElementById('christian-life-chat-messages');
            const christianLifeInput = document.getElementById('christian-life-input');
            const christianLifeSendBtn = document.getElementById('christian-life-send-btn');

            const backToAIAssistantButtons = document.querySelectorAll('.back-to-ai-assistant');

            // Function to display a specific chat interface and hide others
            const showChatInterface = (interfaceToShow) => {
                aiAssistantContent.classList.add('hidden');
                apologeticChatInterface.classList.add('hidden');
                christianLifeChatInterface.classList.add('hidden');

                interfaceToShow.classList.remove('hidden');
                interfaceToShow.style.display = 'flex'; // Ensure flex-col is applied
                interfaceToShow.style.flexDirection = 'column';
            };

            // Function to return to AI assistants selection
            const showAIAssistantSelection = () => {
                aiAssistantContent.classList.remove('hidden');
                aiAssistantContent.style.display = 'grid'; // Revert to grid display for cards
                apologeticChatInterface.classList.add('hidden');
                christianLifeChatInterface.classList.add('hidden');
            };

            // Event listeners to launch chatbots
            launchApologeticBotBtn.addEventListener('click', () => {
                showChatInterface(apologeticChatInterface);
            });

            launchChristianLifeBotBtn.addEventListener('click', () => {
                showChatInterface(christianLifeChatInterface);
            });

            // Event listeners for "Back" buttons
            backToAIAssistantButtons.forEach(button => {
                button.addEventListener('click', showAIAssistantSelection);
            });

            // Specific message adding functions for each bot
            const addApologeticMessage = (sender, message) => addMessage(sender, message, apologeticChatMessages);
            const addChristianLifeMessage = (sender, message) => addMessage(sender, message, christianLifeChatMessages);

            // Send and response logic for Apologetic Bot
            apologeticSendBtn.addEventListener('click', () => {
                const message = apologeticInput.value.trim();
                if (message) {
                    addApologeticMessage('user', message);
                    userJourney.askedQuestions.push(message); // Log question
                    apologeticInput.value = '';
                    handleChatbotResponse(message, apologeticChatMessages, false, 'evangelist'); // false because it's not the main chatbot with redirections
                }
            });
            apologeticInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    apologeticSendBtn.click();
                }
            });

            // Send and response logic for Christian Life AI
            christianLifeSendBtn.addEventListener('click', () => {
                const message = christianLifeInput.value.trim();
                if (message) {
                    addChristianLifeMessage('user', message);
                    userJourney.askedQuestions.push(message); // Log question
                    christianLifeInput.value = '';
                    handleChatbotResponse(message, christianLifeChatMessages, false, 'evangelist'); // false because it's not the main chatbot with redirections
                }
            });
            christianLifeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    christianLifeSendBtn.click();
                }
            });

            // --- Digital Library Logic (now with Gemini API) ---
            const bibleSearchInput = document.getElementById('bible-search-input');
            const bibleSearchBtn = document.getElementById('bible-search-btn');
            const bibleResultDiv = document.getElementById('bible-result');
            const bibleResultReference = document.getElementById('bible-result-reference');
            const bibleResultText = document.getElementById('bible-result-text');

            const searchBibleWithAI = async (query) => {
                bibleResultDiv.classList.remove('hidden');
                bibleResultReference.textContent = "Searching...";
                bibleResultText.textContent = "";

                const prompt = `
                    You are a Bible verse retrieval system. Your sole purpose is to provide the exact text of Bible verses from the New International Version (NIV) based on the user's provided reference.
                    If the user provides a valid Bible reference (e.g., 'John 3:16', 'Psalm 23', 'Genesis 1:1'), return *only* the verse text from the NIV, followed by the reference in parentheses (e.g., 'John 3:16 NIV'). Do not add any commentary, interpretation, or additional information.
                    If the reference is unclear, invalid, or you cannot find it, respond with 'Sorry, I could not find this passage in the NIV Bible. Please check the reference and try again.'

                    User query: "${query}"
                `;

                try {
                    let chatHistory = [];
                    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                    const payload = { contents: chatHistory };
                    const apiKey = ""; // Leave empty, Canvas will provide the key at runtime
                    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    const result = await response.json();
                    if (result.candidates && result.candidates.length > 0 &&
                        result.candidates[0].content && result.candidates[0].content.parts &&
                        result.candidates[0].content.parts.length > 0) {
                        const aiGeneratedText = result.candidates[0].content.parts[0].text;

                        // Attempt to parse the reference and verse text
                        const match = aiGeneratedText.match(/(.*)\s\((.*)\sNIV\)/);
                        if (match && match.length === 3) {
                            bibleResultReference.textContent = match[2] + " (NIV)";
                            bibleResultText.textContent = match[1];
                        } else {
                            // If the expected format is not followed, display the raw response
                            bibleResultReference.textContent = "Search Result:";
                            bibleResultText.textContent = aiGeneratedText;
                        }
                    } else {
                        bibleResultReference.textContent = "Search Error:";
                        bibleResultText.textContent = "Sorry, I couldn't generate a response at the moment. Please try again.";
                        console.error("Unexpected AI response structure:", result);
                    }
                } catch (error) {
                    bibleResultReference.textContent = "Connection Error:";
                    bibleResultText.textContent = "An error occurred while communicating with the AI. Please check your connection or try again later.";
                    console.error("Error calling Gemini API for Bible:", error);
                }
            };

            bibleSearchBtn.addEventListener('click', () => {
                const query = bibleSearchInput.value.trim();
                if (query) {
                    searchBibleWithAI(query);
                } else {
                    bibleResultReference.textContent = "Please enter a Bible reference.";
                    bibleResultText.textContent = "";
                    bibleResultDiv.classList.remove('hidden'); // Ensure it's visible for the error message
                }
            });

            bibleSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    bibleSearchBtn.click();
                }
            });

            // --- Authentication Interface Logic ---
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            const showLoginBtn = document.getElementById('show-login-btn');
            const showRegisterBtn = document.getElementById('show-register-btn');

            const toggleAuthForms = (showLogin) => {
                if (showLogin) {
                    loginForm.classList.remove('hidden');
                    registerForm.classList.add('hidden');
                } else {
                    loginForm.classList.add('hidden');
                    registerForm.classList.remove('hidden');
                }
            };

            showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleAuthForms(true);
            });

            showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                toggleAuthForms(false);
            });

            // --- WhatsApp Chat Modal Logic (Digital Shepherd) ---
            const whatsappChatModal = document.getElementById('whatsapp-chat-modal');
            const openWhatsappChatBtn = document.getElementById('open-whatsapp-chat-btn');
            const whatsappChatMessages = document.getElementById('whatsapp-chat-messages');
            const whatsappInput = document.getElementById('whatsapp-input');
            const whatsappSendBtn = document.getElementById('whatsapp-send-btn');
            const modalCloseBtn = document.querySelector('.modal-close');

            // Function to add message to WhatsApp chat modal
            const addWhatsappMessage = (sender, message) => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message-bubble ${sender}`;
                messageDiv.innerHTML = `<p>${message}</p>`;
                whatsappChatMessages.appendChild(messageDiv);
                whatsappChatMessages.scrollTop = whatsappChatMessages.scrollHeight;
            };

            // Open the WhatsApp chat modal
            openWhatsappChatBtn.addEventListener('click', () => {
                whatsappChatModal.style.display = 'flex';
                // Simulate initial AI message for context
                // This is already in the HTML, so no need to add it again on open unless it's a reset
                // addWhatsappMessage('ai', "Hello! I am The Digital Shepherd. How can I assist you today? I am here to guide you on your journey of faith and answer your questions.");
            });

            // Close the WhatsApp chat modal
            modalCloseBtn.addEventListener('click', () => {
                whatsappChatModal.style.display = 'none';
            });

            // Close modal when clicking outside of it
            window.addEventListener('click', (event) => {
                if (event.target == whatsappChatModal) {
                    whatsappChatModal.style.display = 'none';
                }
            });

            // Handle sending message in WhatsApp chat
            whatsappSendBtn.addEventListener('click', () => {
                const message = whatsappInput.value.trim();
                if (message) {
                    addWhatsappMessage('user', message);
                    userJourney.askedQuestions.push(message); // Log question
                    whatsappInput.value = '';
                    // Call the main handleChatbotResponse with specific botType for Digital Shepherd
                    handleChatbotResponse(message, whatsappChatMessages, false, 'digital-shepherd');
                }
            });

            // Handle Enter key in WhatsApp chat input
            whatsappInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    whatsappSendBtn.click();
                }
            });

            // Example scenario for "Context Maintained"
            // Simulate user completing a module
            // This would typically happen after a quiz or lesson completion
            setTimeout(() => {
                userJourney.completedModules.push('Foundations of Christian Faith - Module 1');
                userJourney.lastLessonCompleted = 'Foundations of Christian Faith - Module 1';
                userJourney.profile = 'believer'; // User might transition from seeker to believer
            }, 5000); // Simulate after 5 seconds

            // Example for "Intelligent Proactive Notification" (simulated after inactivity)
            setInterval(() => {
                const currentTime = Date.now();
                const lastActivity = userJourney.lastActivityTime;
                const inactivityThreshold = 60 * 1000; // 1 minute of inactivity for demonstration

                if (currentTime - lastActivity > inactivityThreshold && userJourney.lastInteractionSection !== 'home') {
                    // Only send if not on home page and inactive
                    const notificationMessage = `
                        Hello again! It seems you've been away for a bit.
                        You recently completed the module "${userJourney.lastLessonCompleted || 'Foundations of Christian Faith - Module 1'}" in our Training Center.
                        Congratulations on your progress! Your commitment is an inspiration.
                        Your next unlocked mission is to "Develop an App for the Community" which aligns perfectly with your "Digital Pioneer" badge!
                        Are you ready to continue your journey and explore new challenges?
                         (https://placehold.co/100x100/10b981/ffffff?text=Digital+Pioneer)
                        Click here to jump back to your training: <a href="#lms" class="text-blue-600 underline" onclick="showSection('lms'); return false;">Training Center</a>
                    `;
                    // In a real app, this would be a push notification or an in-app message.
                    // Here, we'll just log it to console or add to a specific notification area.
                    // For demonstration, we'll add it to the main chatbot messages.
                    // To prevent spamming, reset lastActivityTime after sending.
                    if (chatMessages.querySelector('.ai:last-child')?.textContent !== notificationMessage) { // Simple check to avoid immediate re-sending
                        // addMessage('ai', notificationMessage, chatMessages); // Uncomment to see in main chat
                        console.log("Proactive Notification (simulated):", notificationMessage);
                        userJourney.lastActivityTime = currentTime; // Reset activity to prevent immediate re-send
                    }
                }
            }, 30 * 1000); // Check every 30 seconds for inactivity
        });
    </script>// JavaScript Document