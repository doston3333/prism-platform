// seeders/index.js
const sequelize = require('../config/database');
const {
  User,
  Lesson,
  Quiz,
  Scholarship,
  University,
  FAQ,
  Testimonial,
  Post,
  Comment
} = require('../models');

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Create users
    const users = await User.bulkCreate([
      {
        email: 'admin@prism.uz',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isEmailVerified: true
      },
      {
        email: 'student@prism.uz',
        password: 'student123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'student',
        interests: ['Computer Science', 'Engineering'],
        goals: 'Get into MIT for Computer Science',
        isEmailVerified: true
      },
      {
        email: 'mentor@prism.uz',
        password: 'mentor123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'mentor',
        expertise: ['IELTS Preparation', 'Essay Writing', 'University Selection'],
        bio: 'Harvard alumna with 5+ years of mentoring experience',
        hourlyRate: 50,
        rating: 4.8,
        totalReviews: 23,
        availability: {
          monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
          tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
          wednesday: ['09:00', '10:00', '11:00'],
          thursday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
          friday: ['09:00', '10:00', '11:00']
        },
        isEmailVerified: true
      },
      {
        email: 'parent@prism.uz',
        password: 'parent123',
        firstName: 'Robert',
        lastName: 'Doe',
        role: 'parent',
        isEmailVerified: true
      },
      {
        email: 'mentor2@prism.uz',
        password: 'mentor123',
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'mentor',
        expertise: ['Scholarship Applications', 'Visa Process', 'Interview Prep'],
        bio: 'Stanford graduate, specialized in helping students secure scholarships',
        hourlyRate: 60,
        rating: 4.9,
        totalReviews: 45,
        availability: {
          monday: ['13:00', '14:00', '15:00', '16:00'],
          tuesday: ['13:00', '14:00', '15:00', '16:00'],
          wednesday: ['13:00', '14:00', '15:00', '16:00'],
          thursday: ['13:00', '14:00', '15:00', '16:00'],
          friday: ['13:00', '14:00', '15:00', '16:00']
        },
        isEmailVerified: true
      }
    ]);
    
    console.log('✓ Users created');
    
    // Create lessons
    const lessons = await Lesson.bulkCreate([
      {
        title: 'Introduction to IELTS',
        description: 'Learn about the IELTS exam structure, scoring system, and preparation strategies',
        category: 'IELTS Preparation',
        videoUrl: 'https://example.com/videos/ielts-intro.mp4',
        duration: 1800,
        thumbnail: 'https://example.com/thumbnails/ielts-intro.jpg',
        order: 1,
        tags: ['IELTS', 'English', 'Exam Prep']
      },
      {
        title: 'Writing a Compelling Personal Statement',
        description: 'Master the art of writing personal statements that stand out to admissions committees',
        category: 'Essay Writing',
        videoUrl: 'https://example.com/videos/personal-statement.mp4',
        duration: 2400,
        thumbnail: 'https://example.com/thumbnails/personal-statement.jpg',
        order: 2,
        tags: ['Essays', 'Applications', 'Writing']
      },
      {
        title: 'Understanding University Rankings',
        description: 'Learn how to interpret university rankings and choose the right institution for you',
        category: 'University Selection',
        videoUrl: 'https://example.com/videos/rankings.mp4',
        duration: 1500,
        thumbnail: 'https://example.com/thumbnails/rankings.jpg',
        order: 3,
        tags: ['Universities', 'Rankings', 'Research']
      },
      {
        title: 'Scholarship Application Strategies',
        description: 'Discover proven strategies for finding and winning scholarships',
        category: 'Scholarships',
        videoUrl: 'https://example.com/videos/scholarships.mp4',
        duration: 2100,
        thumbnail: 'https://example.com/thumbnails/scholarships.jpg',
        order: 4,
        tags: ['Scholarships', 'Funding', 'Applications']
      },
      {
        title: 'US Student Visa Process',
        description: 'Complete guide to the F-1 visa application process for the United States',
        category: 'Visa Process',
        videoUrl: 'https://example.com/videos/us-visa.mp4',
        duration: 2700,
        thumbnail: 'https://example.com/thumbnails/us-visa.jpg',
        order: 5,
        tags: ['Visa', 'USA', 'Immigration']
      }
    ]);
    
    console.log('✓ Lessons created');
    
    // Create quizzes for lessons
    const quizzes = await Quiz.bulkCreate([
      {
        lessonId: lessons[0].id,
        title: 'IELTS Basics Quiz',
        questions: [
          {
            question: 'How many sections does the IELTS exam have?',
            options: ['2', '3', '4', '5'],
            correctAnswer: 2
          },
          {
            question: 'What is the maximum IELTS band score?',
            options: ['8', '9', '10', '12'],
            correctAnswer: 1
          },
          {
            question: 'How long is the IELTS Speaking test?',
            options: ['5-10 minutes', '11-14 minutes', '15-20 minutes', '20-25 minutes'],
            correctAnswer: 1
          },
          {
            question: 'Which section comes first in IELTS?',
            options: ['Speaking', 'Writing', 'Listening', 'Reading'],
            correctAnswer: 2
          }
        ],
        passingScore: 75
      },
      {
        lessonId: lessons[1].id,
        title: 'Personal Statement Quiz',
        questions: [
          {
            question: 'What is the typical length of a personal statement?',
            options: ['200-300 words', '500-650 words', '1000-1500 words', '2000+ words'],
            correctAnswer: 1
          },
          {
            question: 'Which should you avoid in a personal statement?',
            options: ['Specific examples', 'Future goals', 'Generic statements', 'Academic achievements'],
            correctAnswer: 2
          },
          {
            question: 'When should you start your personal statement?',
            options: ['Night before deadline', '1 week before', '1 month before', '2-3 months before'],
            correctAnswer: 3
          },
          {
            question: 'What is most important in a personal statement?',
            options: ['Length', 'Vocabulary', 'Authenticity', 'Humor'],
            correctAnswer: 2
          }
        ],
        passingScore: 75
      }
    ]);
    
    console.log('✓ Quizzes created');
    
    // Create scholarships
    const scholarships = await Scholarship.bulkCreate([
      {
        name: 'Fulbright Foreign Student Program',
        country: 'USA',
        deadline: new Date('2025-10-01'),
        amount: 'Full funding',
        field: 'All fields',
        targetGroup: 'Graduate students',
        description: 'Prestigious scholarship for international students to study in the United States',
        requirements: 'Bachelor\'s degree, English proficiency, leadership potential',
        applicationUrl: 'https://foreign.fulbrightonline.org/'
      },
      {
        name: 'Chevening Scholarships',
        country: 'UK',
        deadline: new Date('2025-11-02'),
        amount: 'Full funding',
        field: 'All fields',
        targetGroup: 'Master\'s students',
        description: 'UK government\'s global scholarship programme for future leaders',
        requirements: 'Work experience, leadership qualities, strong academic background',
        applicationUrl: 'https://www.chevening.org/'
      },
      {
        name: 'DAAD Scholarships',
        country: 'Germany',
        deadline: new Date('2025-10-15'),
        amount: '€934/month',
        field: 'All fields',
        targetGroup: 'Graduate students',
        description: 'German Academic Exchange Service scholarships for international students',
        requirements: 'Bachelor\'s degree, German or English proficiency',
        applicationUrl: 'https://www.daad.de/'
      },
      {
        name: 'Australia Awards',
        country: 'Australia',
        deadline: new Date('2025-04-30'),
        amount: 'Full funding',
        field: 'Priority fields',
        targetGroup: 'All levels',
        description: 'Australian Government scholarships for developing countries',
        requirements: 'Country eligibility, English proficiency, development impact',
        applicationUrl: 'https://www.australiaawards.gov.au/'
      },
      {
        name: 'Korean Government Scholarship',
        country: 'South Korea',
        deadline: new Date('2025-09-30'),
        amount: 'Full funding + stipend',
        field: 'All fields',
        targetGroup: 'All levels',
        description: 'KGSP for international students to study in Korea',
        requirements: 'Age limit, GPA 2.64+, Korean or English proficiency',
        applicationUrl: 'https://www.studyinkorea.go.kr/'
      }
    ]);
    
    console.log('✓ Scholarships created');
    
    // Create universities
    const universities = await University.bulkCreate([
      {
        name: 'Massachusetts Institute of Technology',
        country: 'USA',
        ranking: 1,
        tuitionFee: '$57,590/year',
        ieltsRequirement: 7.0,
        description: 'World-renowned institute for science, technology, and engineering',
        majors: ['Computer Science', 'Engineering', 'Physics', 'Mathematics', 'Economics'],
        applicationUrl: 'https://mitadmissions.org/',
        images: ['https://example.com/mit1.jpg', 'https://example.com/mit2.jpg'],
        deadline: 'January 1'
      },
      {
        name: 'University of Cambridge',
        country: 'UK',
        ranking: 2,
        tuitionFee: '£35,517/year',
        ieltsRequirement: 7.5,
        description: 'Historic university known for academic excellence',
        majors: ['Medicine', 'Law', 'Engineering', 'Natural Sciences', 'Economics'],
        applicationUrl: 'https://www.undergraduate.study.cam.ac.uk/',
        images: ['https://example.com/cambridge1.jpg', 'https://example.com/cambridge2.jpg'],
        deadline: 'October 15'
      },
      {
        name: 'Stanford University',
        country: 'USA',
        ranking: 3,
        tuitionFee: '$56,169/year',
        ieltsRequirement: 7.0,
        description: 'Leading university in Silicon Valley',
        majors: ['Computer Science', 'Business', 'Engineering', 'Medicine', 'Law'],
        applicationUrl: 'https://admission.stanford.edu/',
        images: ['https://example.com/stanford1.jpg', 'https://example.com/stanford2.jpg'],
        deadline: 'January 2'
      },
      {
        name: 'ETH Zurich',
        country: 'Switzerland',
        ranking: 8,
        tuitionFee: 'CHF 730/semester',
        ieltsRequirement: 7.0,
        description: 'Top European technical university',
        majors: ['Engineering', 'Computer Science', 'Architecture', 'Mathematics', 'Physics'],
        applicationUrl: 'https://ethz.ch/en/studies.html',
        images: ['https://example.com/eth1.jpg', 'https://example.com/eth2.jpg'],
        deadline: 'December 15'
      },
      {
        name: 'National University of Singapore',
        country: 'Singapore',
        ranking: 11,
        tuitionFee: 'S$32,250/year',
        ieltsRequirement: 6.5,
        description: 'Asia\'s leading global university',
        majors: ['Business', 'Computing', 'Engineering', 'Medicine', 'Law'],
        applicationUrl: 'https://www.nus.edu.sg/admissions',
        images: ['https://example.com/nus1.jpg', 'https://example.com/nus2.jpg'],
        deadline: 'February 28'
      }
    ]);
    
    console.log('✓ Universities created');
    
    // Create FAQs
    const faqs = await FAQ.bulkCreate([
      {
        question: 'What IELTS score do I need for US universities?',
        answer: 'Most US universities require an IELTS score between 6.5 and 7.5. Top universities like MIT, Harvard, and Stanford typically require 7.0 or higher. However, requirements vary by program, so always check the specific requirements for your chosen university and program.',
        category: 'IELTS',
        order: 1
      },
      {
        question: 'How do I write a strong personal statement?',
        answer: 'Start early and be authentic. Focus on specific experiences that shaped your interests and goals. Show, don\'t tell - use concrete examples. Connect your past experiences to your future goals and explain why this specific program is right for you. Have multiple people review your statement and revise it several times.',
        category: 'Applications',
        order: 2
      },
      {
        question: 'When should I start preparing for applications?',
        answer: 'Ideally, start 12-18 months before your intended start date. This gives you time to prepare for standardized tests (IELTS/TOEFL, GRE/GMAT), research universities, gather recommendation letters, write essays, and complete applications without rushing.',
        category: 'General',
        order: 3
      },
      {
        question: 'How can I find scholarships?',
        answer: 'Start with our scholarship database and filter by your field and target country. Also check university websites for institution-specific scholarships, government scholarship programs from your target country, and professional organizations in your field. Apply to multiple scholarships to increase your chances.',
        category: 'Scholarships',
        order: 4
      },
      {
        question: 'What documents do I need for a student visa?',
        answer: 'Common requirements include: valid passport, university acceptance letter (I-20 for USA, CAS for UK), financial proof, IELTS/TOEFL scores, academic transcripts, and visa application forms. Requirements vary by country, so check the specific embassy website for your destination country.',
        category: 'Visa',
        order: 5
      }
    ]);
    
    console.log('✓ FAQs created');
    
    // Create testimonials
    const testimonials = await Testimonial.bulkCreate([
      {
        name: 'Dilshod Karimov',
        role: 'MIT Student',
        content: 'Prism helped me navigate the complex application process to MIT. The mentorship and resources were invaluable. I especially appreciated the IELTS preparation lessons and personal statement guidance.',
        image: 'https://example.com/testimonial1.jpg'
      },
      {
        name: 'Nodira Azimova',
        role: 'Cambridge Student',
        content: 'Thanks to Prism, I secured a full scholarship to Cambridge! The platform\'s structured approach and amazing mentors made my dream possible. The scholarship finder tool saved me so much time.',
        image: 'https://example.com/testimonial2.jpg'
      },
      {
        name: 'Jasur Yusupov',
        role: 'Parent',
        content: 'As a parent, I love being able to track my son\'s progress. The platform keeps me informed about deadlines and milestones. It gives me peace of mind knowing he has professional guidance.',
        image: 'https://example.com/testimonial3.jpg'
      }
    ]);
    
    console.log('✓ Testimonials created');
    
    // Create sample forum posts
    const posts = await Post.bulkCreate([
      {
        userId: users[1].id, // Student user
        title: 'Tips for IELTS Speaking Test',
        content: 'Hey everyone! I just took my IELTS speaking test and wanted to share some tips that helped me get an 8.0. First, practice speaking English daily - even if it\'s just talking to yourself. Second, record yourself to identify areas for improvement. Third, learn topic-specific vocabulary but use it naturally. Anyone else have tips to share?',
        category: 'ielts',
        likes: 15,
        views: 234
      },
      {
        userId: users[2].id, // Mentor user
        title: 'Common Mistakes in Personal Statements',
        content: 'After reviewing hundreds of personal statements, here are the most common mistakes I see: 1) Being too generic - admissions officers read thousands of these. 2) Listing achievements without reflection. 3) Poor structure and flow. 4) Not explaining "why this university". Remember, your personal statement should tell YOUR unique story!',
        category: 'essays',
        likes: 42,
        views: 567,
        isPinned: true
      },
      {
        userId: users[1].id,
        title: 'F-1 Visa Interview Experience',
        content: 'Just had my F-1 visa interview at the US Embassy! It lasted about 5 minutes. They asked: Why this university? How will you fund your studies? What are your plans after graduation? My advice: be confident, prepare documents well, and have clear answers about your study plans and intent to return.',
        category: 'visa',
        likes: 28,
        views: 412
      }
    ]);
    
    // Update post counts
    await User.increment('postCount', { 
      where: { id: users[1].id },
      by: 2
    });
    await User.increment('postCount', { 
      where: { id: users[2].id }
    });
    
    console.log('✓ Forum posts created');
    
    // Create sample comments
    await Comment.bulkCreate([
      {
        postId: posts[0].id,
        userId: users[2].id,
        content: 'Great tips! I\'d also add that familiarizing yourself with common IELTS topics helps a lot. Practice talking about education, technology, environment, and culture - these come up frequently.'
      },
      {
        postId: posts[0].id,
        userId: users[4].id,
        content: 'Thanks for sharing! How did you handle the part where they ask follow-up questions? That\'s where I usually struggle.'
      },
      {
        postId: posts[1].id,
        userId: users[1].id,
        content: 'This is so helpful! I\'ve been struggling with making my statement stand out. Could you give an example of how to reflect on achievements effectively?'
      }
    ]);
    
    console.log('✓ Comments created');
    console.log('\n✅ Database seeding completed successfully!');
    
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@prism.uz / admin123');
    console.log('Student: student@prism.uz / student123');
    console.log('Mentor: mentor@prism.uz / mentor123');
    console.log('Parent: parent@prism.uz / parent123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  sequelize.sync({ force: true })
    .then(() => seedDatabase())
    .then(() => {
      console.log('\n🎉 All done! You can now start the server.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Failed to seed database:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;