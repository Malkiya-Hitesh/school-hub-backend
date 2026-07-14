import fs from "fs";
import csv from "csv-parser";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const schools = [];

fs.createReadStream(
  "./emails/rajkot-private-1.csv"
)
  .pipe(csv())
  .on("data", (row) => {
    schools.push(row);
  })
  .on("end", async () => {
    console.log(
      `Found ${schools.length} schools`
    );

    for (const school of schools) {
      try {
        await resend.emails.send({
          from:
            "Hitesh Malkiya <hello@schoolhub.in>",

          to: school.email,

          subject: `Building a Digital Ecosystem for Schools – Your Guidance Needed | ${school.schoolName}`,

          html: `
          <div style="font-family:Arial,sans-serif;line-height:1.7;max-width:700px">

          <p>Dear Sir/Madam,</p>

          <p><b>${school.schoolName}</b></p>

          <p>Greetings 🙏</p>

          <p>
          My name is <b>Hitesh Malkiya</b>. I am a BCA student and web developer from Gujarat, currently working on an educational initiative called <b>SchoolHub</b>.
          </p>

          <p>
          The core vision of SchoolHub is simple:
          </p>

          <blockquote>
          To connect schools, students, and parents on one trusted platform and centralize school information to make school discovery and admissions more transparent and efficient.
          </blockquote>

          <h3>Problems Observed</h3>

          <p><b>Schools face challenges such as:</b></p>

          <ul>
            <li>Limited online presence and Google visibility.</li>
            <li>Difficulty reaching the right students.</li>
            <li>Marketing expenses with limited results.</li>
            <li>Difficulty showcasing facilities and achievements.</li>
          </ul>

          <p><b>Parents and students face challenges such as:</b></p>

          <ul>
            <li>Difficulty finding the right school.</li>
            <li>Scattered information across platforms.</li>
            <li>Limited information on Google Maps and Justdial.</li>
            <li>Lack of genuine reviews and comparisons.</li>
          </ul>

          <h3>What is SchoolHub?</h3>

          <ul>
            <li>Search schools using filters like district, taluka, board, medium, facilities, etc.</li>
            <li>Access academic information, facilities, results, achievements and reviews.</li>
            <li>Direct admission inquiries to schools.</li>
            <li>Dedicated digital profile for every school.</li>
            <li>Better online visibility and genuine student leads.</li>
          </ul>

          <p>
          My goal is not only to build a school listing platform but to create a trusted digital ecosystem for education.
          </p>

          <p>
          Since you are an experienced educational institution, your guidance would be extremely valuable.
          </p>

          <p>
          I would sincerely appreciate your thoughts on:
          </p>

          <ol>
            <li>Does this solve real problems?</li>
            <li>What additional features should be added?</li>
            <li>What challenges do you foresee?</li>
            <li>Would schools participate in such a platform?</li>
            <li>Any advice regarding mentorship, partnerships or funding opportunities?</li>
          </ol>

          <p>
          As a student founder, I am building this initiative independently and would be grateful for your guidance, suggestions, industry insights, introductions, or support.
          </p>

          <p>
          If you find this idea meaningful, I would be happy to connect further.
          </p>

          <br/>

          <p>
          Warm Regards,<br><br>

          <b>Hitesh Malkiya</b><br>
          Founder – SchoolHub<br>
          BCA Student & Web Developer<br><br>

          📧 Email:
          <a href="mailto:hiteshmalkiya8@gmail.com">
          hiteshmalkiya8@gmail.com
          </a><br>

          📞 Phone: +91 7046613120<br>

          🌐 Portfolio:
          <a href="https://malkiya-hitesh.tech">
          malkiya-hitesh.tech
          </a>
          </p>

          </div>
          `,
        });

        console.log(
          `✅ Sent: ${school.email}`
        );

        await new Promise((r) =>
          setTimeout(r, 1000)
        );
      } catch (err) {
        console.log(
          `❌ Failed: ${school.email}`
        );

        console.log(err.message);
      }
    }

    console.log("🚀 Done");
  });