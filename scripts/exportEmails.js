import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import School from "../models/School.js";

dotenv.config();

async function exportEmails() {
  try {
    // MongoDB Connect
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    // Get Rajkot Private Schools
    const schools = await School.find(
      {
        "address.district": "RAJKOT",
        "category.management": "PRIVATESCHOOL",
        "basics.email": {
          $exists: true,
          $nin: [null, ""],
        },
      },
      {
        "basics.schoolName": 1,
        "basics.email": 1,
      }
    ).lean();

    console.log(
      `📧 Found ${schools.length} schools`
    );

    // Remove duplicate emails
    const uniqueSchools = [
      ...new Map(
        schools.map((school) => [
          school.basics.email
            .trim()
            .toLowerCase(),
          school,
        ])
      ).values(),
    ];

    console.log(
      `✅ Unique Emails: ${uniqueSchools.length}`
    );

    // Create output folder
    if (!fs.existsSync("./emails")) {
      fs.mkdirSync("./emails");
    }

    const chunkSize = 100;

    // Split into CSV files of 100 emails each
    for (
      let i = 0;
      i < uniqueSchools.length;
      i += chunkSize
    ) {
      const chunk = uniqueSchools.slice(
        i,
        i + chunkSize
      );

      const csv =
        "schoolName,email\n" +
        chunk
          .map(
            (school) =>
              `"${school.basics.schoolName.replace(
                /"/g,
                '""'
              )}","${school.basics.email}"`
          )
          .join("\n");

      const fileNumber =
        Math.floor(i / chunkSize) + 1;

      const fileName = `./emails/rajkot-private-${fileNumber}.csv`;

      fs.writeFileSync(fileName, csv);

      console.log(
        `✅ Created: ${fileName}`
      );
    }

    console.log(
      `🚀 Done! Created ${Math.ceil(
        uniqueSchools.length /
          chunkSize
      )} CSV files`
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "❌ Error:",
      error.message
    );

    process.exit(1);
  }
}

exportEmails();