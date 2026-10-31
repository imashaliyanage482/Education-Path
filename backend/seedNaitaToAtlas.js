const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');
const Course = require('./models/Course');
const Institution = require('./models/Institution');
const fs = require('fs');

const seedNaita = async () => {
  try {
    await connectDB();

    // 1. Find NAITA Institution ID
    let naitaInst = await Institution.findOne({ shortName: 'NAITA' });
    if (!naitaInst) {
      console.log('Creating NAITA institution record in Atlas...');
      naitaInst = await Institution.create({
        name: 'National Apprentice and Industrial Training Authority',
        shortName: 'NAITA',
        category: 'Apprenticeship Institutes',
        isVerified: true,
      });
    }

    const naitaId = naitaInst._id;
    console.log(`Using NAITA Institution ID: ${naitaId}`);

    // 2. Load 43 verified courses from all_naita_courses.json
    const allCourses = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../all_naita_courses.json'), 'utf8'));
    console.log(`Loaded ${allCourses.length} verified NAITA courses to synchronize.`);

    // 3. Remove only previously seeded NAITA courses to avoid duplicates, PRESERVING VTA courses
    const existingNaitaCount = await Course.countDocuments({ institutionId: naitaId });
    console.log(`Existing NAITA courses in DB: ${existingNaitaCount}`);
    await Course.deleteMany({ institutionId: naitaId });

    // Map study fields to valid CourseSchema enums
    const mapStudyField = (category) => {
      const cat = (category || '').toLowerCase();
      if (cat.includes('auto') || cat.includes('metal') || cat.includes('light') || cat.includes('mechanic') || cat.includes('electric') || cat.includes('refrigeration') || cat.includes('welder') || cat.includes('machinist')) {
        return 'Engineering & Technology';
      }
      if (cat.includes('construct') || cat.includes('plumber') || cat.includes('carpenter') || cat.includes('wood') || cat.includes('draughtsperson') || cat.includes('civil')) {
        return 'Engineering & Technology';
      }
      if (cat.includes('information') || cat.includes('communication') || cat.includes('computer') || cat.includes('ict')) {
        return 'Information Technology';
      }
      if (cat.includes('health') || cat.includes('nurse') || cat.includes('care')) {
        return 'Medicine & Healthcare';
      }
      if (cat.includes('hotel') || cat.includes('cookery') || cat.includes('restaurant')) {
        return 'Hospitality & Tourism';
      }
      if (cat.includes('textile') || cat.includes('garment') || cat.includes('tailor') || cat.includes('graphic') || cat.includes('beautician') || cat.includes('hair')) {
        return 'Design & Multimedia';
      }
      if (cat.includes('office') || cat.includes('clerk') || cat.includes('management') || cat.includes('customer')) {
        return 'Business & Management';
      }
      if (cat.includes('agri') || cat.includes('nursery') || cat.includes('farm')) {
        return 'Science & Biotechnology';
      }
      return 'Engineering & Technology';
    };

    const mapQualType = (qual) => {
      if (qual === 'Diploma') return 'Diploma';
      return 'Certificate';
    };

    const parseLkrFee = (feeStr) => {
      if (!feeStr) return 0;
      const clean = feeStr.replace(/[^0-9]/g, '');
      return clean ? parseInt(clean, 10) : 0;
    };

    const documentsToInsert = allCourses.map((c) => {
      const totalFee = parseLkrFee(c.courseFee);
      const regFee = parseLkrFee(c.registrationFee) || 1000;

      return {
        name: c.name,
        sinhalaName: c.sinhalaName || undefined,
        institutionId: naitaId,
        institutionName: `National Apprentice and Industrial Training Authority (NAITA) - ${c.providerType}`,
        institutionLogo: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=150&auto=format&fit=crop&q=80',
        qualificationType: mapQualType(c.qualificationType),
        studyField: mapStudyField(c.category),
        duration: c.duration,
        studyMode: ['Full-time', 'Physical'],
        teachingLanguage: ['Sinhala', 'English'],
        overview: `${c.description} [${c.nvqLevel}] [Training Provider: ${c.trainingCentre}]`,
        sinhalaOverview: c.sinhalaName ? `${c.sinhalaName} - ශ්‍රී ලංකා ජාතික ආධුනිකත්ව සහ කාර්මික පුහුණු කිරීමේ අධිකාරිය (NAITA) යටතේ ක්‍රියාත්මක ${c.nvqLevel} වෘත්තීය පාඨමාලාව.` : undefined,
        fees: {
          totalFeeLKR: totalFee,
          registrationFeeLKR: regFee,
          installmentAvailable: totalFee > 0,
          scholarshipAvailable: true,
          scholarshipNote: 'Free government training available for low-income Aswasuma families. Monthly apprentice allowances eligible.',
        },
        entryRequirements: {
          olRequirement: {
            minimumPasses: 6,
            details: c.entryRequirements,
          },
          minimumAge: 16,
          otherNotes: `Official Source: ${c.officialSourceUrl} | Verified Date: ${c.verificationDate}`,
        },
        skillsGained: c.features || ['Practical Workshop Training', 'Industrial Apprenticeship Placement'],
        careerOpportunities: [`Professional ${c.name}`, 'Certified Technician', 'Overseas Technical Employment'],
        qualificationAwarded: `${c.qualificationType} (${c.nvqLevel})`,
        awardingBody: 'National Apprentice and Industrial Training Authority / TVEC',
        accreditation: ['TVEC Accredited', 'NAITA Act No. 20 of 1990', c.nvqLevel],
        intakeMonths: ['January', 'July'],
        applicationDeadline: '2026/2027 Intakes Active',
        officialApplyLink: c.officialSourceUrl,
        officialWebsite: 'https://naita.gov.lk',
        coverImage: c.coverImage,
        isPopular: true,
        lastVerifiedDate: '2026-10-31',
      };
    });

    const result = await Course.insertMany(documentsToInsert);
    console.log(`✅ Successfully seeded ${result.length} verified NAITA courses into MongoDB Atlas!`);

    // Verify existing VTA courses are safe and preserved
    const totalCourses = await Course.countDocuments({});
    const vtaCourses = await Course.countDocuments({ institutionName: /Vocational Training Authority/ });
    const naitaCourses = await Course.countDocuments({ institutionId: naitaId });

    console.log(`\n--- Verification Summary in MongoDB Atlas ---`);
    console.log(`Total Courses in DB: ${totalCourses}`);
    console.log(`VTA Courses Preserved: ${vtaCourses}`);
    console.log(`NAITA Courses Synchronized: ${naitaCourses}`);

    process.exit(0);
  } catch (err) {
    console.error('Error seeding NAITA courses:', err);
    process.exit(1);
  }
};

seedNaita();
