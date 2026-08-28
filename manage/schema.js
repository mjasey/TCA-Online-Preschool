(function () {
  const page = (title, description, path, sections, defaults) => ({ title, description, path, sections, defaults });
  const field = (key, label, type = 'text', help = '') => ({ key, label, type, help });

  window.TCA_CMS = {
    pages: {
      home: page(
        'Home page',
        'The first impression families receive: your welcome, promise, mission, teachers, tuition, and contact invitation.',
        '../index.html',
        [
          { title: 'Welcome banner', open: true, fields: [
            field('hero.eyebrow', 'Small heading'),
            field('hero.title', 'Main headline'),
            field('hero.accent', 'Highlighted words'),
            field('hero.intro', 'Welcome message', 'textarea'),
            field('hero.video', 'Background video', 'video', 'Upload an MP4/WebM file or paste a direct video URL.')
          ]},
          { title: 'Founder message', fields: [
            field('founder.video', 'Founder video', 'video', 'Upload an MP4/WebM file or paste a direct video URL.'),
            field('founder.title', 'Section heading'),
            field('founder.accent', 'Highlighted word'),
            field('founder.promise1', 'Promise 1', 'textarea'),
            field('founder.promise2', 'Promise 2', 'textarea'),
            field('founder.promise3', 'Promise 3', 'textarea'),
            field('founder.promise4', 'Promise 4', 'textarea'),
            field('founder.quote', 'Founder quote', 'textarea')
          ]},
          { title: 'Mission', fields: [
            field('mission.statement', 'Mission statement', 'textarea'),
            field('mission.scripture', 'Scripture quotation', 'textarea'),
            field('mission.attribution', 'Scripture reference')
          ]},
          { title: 'Teachers', fields: [
            field('teachers.sherriPhoto', 'Sherri’s photo', 'image'),
            field('teachers.sherriBio', 'Sherri’s introduction', 'textarea'),
            field('teachers.vanessaPhoto', 'Vanessa’s photo', 'image'),
            field('teachers.vanessaBio', 'Vanessa’s introduction', 'textarea'),
            field('teachers.vanessaVideo', 'Class-in-session video', 'video')
          ]},
          { title: 'Tuition and contact', fields: [
            field('tuition.registration', 'Registration fee'),
            field('tuition.description', 'Registration description', 'textarea'),
            field('contact.intro', 'Contact invitation', 'textarea'),
            field('contact.phone', 'Phone number'),
            field('contact.email', 'Public email address', 'email')
          ]}
        ],
        {
          hero: { eyebrow: 'A Christ-Centered Online Preschool', title: 'Where Faith Meets', accent: 'Learning', intro: "Small classes, patient teachers, and the steady rhythm of God's Word — shaping a child's earliest years with love, scripture, and joy.", video: 'hero-video.mp4' },
          founder: {
            video: 'Sherri-Why-Choose.mp4', title: 'What Makes TCA', accent: 'Different',
            promise1: "Faith woven into every session — your child will know God's Word and grow in His love daily.",
            promise2: 'Live interactive Zoom classes with a real, passionate teacher who knows your child by name.',
            promise3: 'Small, intimate class sizes ensure every child gets the individual attention they deserve.',
            promise4: 'Learning materials provided conveniently so your child always has everything they need to engage, explore, and grow.',
            quote: '“Our preschool program is designed to help children build confidence in speaking and expressing their ideas.”'
          },
          mission: {
            statement: 'Become a recognized leader in education, providing children with a rigorous Christ-centered education that will prepare them to be creative critical-thinkers, problem-solvers, and entrepreneurs — to raise a generation to love God and embrace His precepts.',
            scripture: '“The people that know their God shall be strong and do great exploits for Him.”',
            attribution: '— Daniel 11:32 —'
          },
          teachers: {
            sherriPhoto: 'Sherri.png',
            sherriBio: 'Sherri Taylor founded Taylor Christian Academy with a singular vision: to make exceptional, faith-rooted education accessible to every family. She believes all children deserve a quality education in a loving, safe environment — and should have fun while attaining it.',
            vanessaPhoto: 'Vanessa.png',
            vanessaBio: "Miss Vanessa brings warmth, patience, and deep expertise to every class. Her master's-level training means she understands not just what to teach, but how young minds grow and thrive — making every Zoom session something your child will look forward to all week long.",
            vanessaVideo: 'Vanessa-Demo.mp4'
          },
          tuition: { registration: '$60', description: 'Bundled with your first payment. Your enrollment bundle covers classes and materials from there.' },
          contact: { intro: "We'd love to welcome your child into the TCA family. Send us a note and we'll be in touch within 24 hours to answer your questions and help you pick the perfect class time.", phone: '908-738-1343', email: 'info@tcaarts.org' }
        }
      ),
      enroll: page(
        'Enrollment page',
        'The steps, plan prices, payment links, and class times families use to enroll.',
        '../enroll.html',
        [
          { title: 'Enrollment welcome', open: true, fields: [
            field('hero.eyebrow', 'Small heading'),
            field('hero.title', 'Main headline'),
            field('hero.accent', 'Highlighted words'),
            field('hero.intro', 'Short explanation', 'textarea'),
            field('hero.video', 'Background video', 'video')
          ]},
          { title: 'What happens next', fields: [
            field('steps.intro', 'Steps introduction', 'textarea'),
            field('steps.step1Title', 'Step 1 title'),
            field('steps.step1Text', 'Step 1 explanation', 'textarea'),
            field('steps.step2Title', 'Step 2 title'),
            field('steps.step2Text', 'Step 2 explanation', 'textarea'),
            field('steps.step3Title', 'Step 3 title'),
            field('steps.step3Text', 'Step 3 explanation', 'textarea')
          ]},
          { title: 'Plan 1 · one session', fields: [
            field('plans.one.name', 'Plan name'), field('plans.one.price', 'Recurring price'), field('plans.one.cadence', 'Billing description'), field('plans.one.today', 'First payment'), field('plans.one.link', 'Stripe checkout link', 'url')
          ]},
          { title: 'Plan 2 · two sessions', fields: [
            field('plans.two.name', 'Plan name'), field('plans.two.price', 'Recurring price'), field('plans.two.cadence', 'Billing description'), field('plans.two.today', 'First payment'), field('plans.two.link', 'Stripe checkout link', 'url')
          ]},
          { title: 'Plan 3 · monthly', fields: [
            field('plans.monthly.name', 'Plan name'), field('plans.monthly.price', 'Recurring price'), field('plans.monthly.cadence', 'Billing description'), field('plans.monthly.today', 'First payment'), field('plans.monthly.link', 'Stripe checkout link', 'url')
          ]},
          { title: 'Class times', fields: [
            field('schedule.intro', 'Schedule introduction'),
            field('schedule.class1', 'Class time 1'),
            field('schedule.class2', 'Class time 2'),
            field('schedule.class3', 'Class time 3')
          ]}
        ],
        {
          hero: { eyebrow: 'Enrollment', title: "Secure Your Child's", accent: 'Spot Today.', intro: 'Three simple plans. One bundled first payment. Your welcome kit ships within a week.', video: 'hero-video.mp4' },
          steps: {
            intro: "Enrollment is quick and fully hands-off — here's exactly what to expect after you choose a plan.",
            step1Title: 'Choose Your Plan', step1Text: 'Select the rhythm that fits your family. Your first payment includes the $60 registration fee — no separate forms, no follow-up invoice.',
            step2Title: 'Receive Your Kit', step2Text: 'Your materials kit ships within one week to the address you provided at checkout. Everything your child needs for class, free shipping included.',
            step3Title: 'Join Your First Class', step3Text: 'You will receive an email from info@tcaarts.org with information for the first day of class, including login information. Email any questions you may have.'
          },
          plans: {
            one: { name: '1 Session a Week', price: '$25', cadence: 'per week · recurring', today: '$85 today', link: 'https://buy.stripe.com/6oU5kF1MN6nL7vlaaN9bO02' },
            two: { name: '2 Sessions a Week', price: '$40', cadence: 'per week · recurring', today: '$100 today', link: 'https://buy.stripe.com/4gMdRbdvv5jH5nd4Qt9bO03' },
            monthly: { name: 'Monthly Plan', price: '$150', cadence: 'per month · 8 sessions', today: '$210 today', link: 'https://buy.stripe.com/fZu3cxezz27vaHx96J9bO04' }
          },
          schedule: { intro: "Pick the time that fits your family's rhythm. All times EST.", class1: 'Tuesday & Thursday · 10:00–10:45 AM · Eastern Time', class2: 'Tuesday & Thursday · 12:00–12:45 PM · Eastern Time', class3: 'Tuesday · 5:30–6:15 PM · Eastern Time' }
        }
      ),
      donate: page(
        'Giving page',
        'The donation invitation, gift amounts, payment links, and the story of where each gift goes.',
        '../donate.html',
        [
          { title: 'Giving welcome', open: true, fields: [
            field('hero.eyebrow', 'Small heading'), field('hero.title', 'Main headline'), field('hero.accent', 'Highlighted words'), field('hero.intro', 'Giving invitation', 'textarea'), field('hero.video', 'Background video', 'video')
          ]},
          { title: 'Gift amounts and links', fields: [
            field('gifts.intro', 'Gift section introduction', 'textarea'),
            field('gifts.amount1', 'Gift amount 1'), field('gifts.link1', 'Checkout link 1', 'url'),
            field('gifts.amount2', 'Gift amount 2'), field('gifts.link2', 'Checkout link 2', 'url'),
            field('gifts.amount3', 'Gift amount 3'), field('gifts.link3', 'Checkout link 3', 'url')
          ]},
          { title: 'Impact', fields: [
            field('impact.scholarships', 'Scholarship families explanation', 'textarea'),
            field('impact.curriculum', 'Curriculum explanation', 'textarea'),
            field('impact.thanks', 'Thank-you message', 'textarea')
          ]}
        ],
        {
          hero: { eyebrow: 'Support Our Mission', title: 'Help us bring Christ-centered education to', accent: 'every family.', intro: 'Your gift supports scholarship families and Christ-centered curriculum — so more children can learn the Word, find their voice, and grow with confidence.', video: 'hero-video.mp4' },
          gifts: {
            intro: 'Every amount matters. Every gift helps a child open a Bible, meet a teacher who knows their name, and grow in a classroom built on faith.',
            amount1: '$10', link1: 'https://buy.stripe.com/14A8wR1MNh2p6rhfv79bO09', amount2: '$25', link2: 'https://buy.stripe.com/8x200l1MNfYl9DtciV9bO06', amount3: '$50', link3: 'https://buy.stripe.com/dRm3cx9ffbI53f55Ux9bO07'
          },
          impact: {
            scholarships: "Some families would love Christ-centered education for their child but can't stretch to the monthly tuition. Your gift opens the door — a scholarship seat means one more little one in class next term.",
            curriculum: 'Scripture cards, printable lesson sheets, Bible-story workbooks, music materials — the tools that make each Zoom class feel like a classroom, not a call. Your gift keeps the shelves stocked.',
            thanks: 'Whether you give $10 or pray for our school from afar, you are part of what God is building here. Thank you for believing in this work — and in the children it serves.'
          }
        }
      )
    }
  };
})();
