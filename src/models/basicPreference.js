const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const BasicPreference = sequelize.define(
  "BasicPreference",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    preferredAge: {
      type: DataTypes.ENUM(
        "18-21",
        "21-24",
        "24-27",
        "27-30",
        "30-33",
        "Above 33"
      ),
      allowNull: true,
    },

    preferredHeight: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferredWeight: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    preferredMaritalStatus: {
      type: DataTypes.ENUM(
        "Never Married",
        "Widower",
        "Awaiting Divorce",
        "Divorced",
        "Widow"
      ),
      allowNull: true,
    },

    preferredMotherToungue: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    preferredEatingHabits: {
      type: DataTypes.ENUM("Veg", "Non-Veg", "Vegan", "Doesn't Matter"),
      allowNull: true,
    },

    preferredDrinkingHabits: {
      type: DataTypes.ENUM("No", "Yes", "Occassionally", "Doesn't Matter"),
      allowNull: true,
    },

    preferredSmokingHabits: {
      type: DataTypes.ENUM("No", "Yes", "Occassionally", "Doesn't Matter"),
      allowNull: true,
    },

    preferredReligion: {
      type: DataTypes.ENUM(
        "Buddhism",
        "Christian",
        "Hindu",
        "Muslim",
        "Jain",
        "Jewish",
        "Parsi",
        "Sikh",
        "Doesn't Matter"
      ),
      allowNull: true,
    },

    preferredCaste: {
      type: DataTypes.ENUM(
        "Baniya",
        "Banjara",
        "Bari",
        "Berad",
        "Bhoep",
        "Brahman",
        "Buddha",
        "Burud",
        "Chambhar",
        "Dhangar",
        "Dhiwar",
        "Dhobi",
        "Dombari",
        "Gandali",
        "Gavali",
        "Golkar",
        "Gond",
        "Govind",
        "Gowari",
        "Gurav",
        "Hanber",
        "Holar",
        "Holi",
        "Jain",
        "Kalar",
        "Karvi",
        "Kohali",
        "Kolam",
        "Koli",
        "Korku",
        "Koshti",
        "Kumbi",
        "Kumhar",
        "Kunbi",
        "Laman",
        "Lingayat",
        "Lodhi",
        "Lohar",
        "Mahar",
        "Mali",
        "Mana",
        "Mang",
        "Maratha",
        "Marwadi",
        "Matang",
        "Mavi",
        "Muslim",
        "Nathjogi",
        "Nhavi",
        "Panchal",
        "Pardesi",
        "Pardi",
        "Parit",
        "Pathan",
        "Powar",
        "Pinjara",
        "Pradhan",
        "Rajput",
        "Ramoshi",
        "Sayed",
        "Shikaghar",
        "Shimpi",
        "Sonar",
        "Sutar",
        "Teli",
        "Wani",
        "Wadar",
        "Wadhi",
        "Wami",
        "Wathi",
        "Doesn't Matter"
      ),
      allowNull: true,
    },

    preferredSubCaste: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    preferredRas: {
      type: DataTypes.ENUM(
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
        "Doesn't Matter"
      ),
      allowNull: true,
    },

    preferredGan: {
      type: DataTypes.ENUM("Deva", "Manushya", "Rakshasa", "Doesn't Matter"),
      allowNull: true,
    },

    preferredMangal: {
      type: DataTypes.ENUM("Yes", "No", "Partial", "Doesn't Matter"),
      allowNull: true,
    },

    preferredNaadi: {
      type: DataTypes.ENUM("Aadi", "Madhya", "Antya", "Doesn't Matter"),
      allowNull: true,
    },

    preferredCharan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferredNakshatra: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    preferredGotra: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    preferredEducation: {
      type: DataTypes.ENUM(
        "10th",
        "12th",
        "Diploma",
        "Graduation",
        "Post-Graduation",
        "Doesn't Matter"
      ),
      allowNull: false,
      validate: {
        isIn: {
          args: [
            [
              "10th",
              "12th",
              "Diploma",
              "Graduation",
              "Post-Graduation",
              "Doesn't Matter",
            ],
          ],
          msg: "Invalid education value provided.",
        },
      },
    },

    preferredJobSector: {
      type: DataTypes.ENUM(
        "Private",
        "Government",
        "Freelance",
        "Business",
        "Doesn't Matter"
      ),
      allowNull: false,
      validate: {
        isIn: {
          args: [
            ["Private", "Government", "Freelance", "Business", "Doesn't Matter"],
          ],
          msg: "Job sector must be 'Private', 'Government', 'Freelance', or 'Business'.",
        },
      },
    },

    preferredJobLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    
    preferredAnnualSalary: {
      type: DataTypes.ENUM(
        "Below 1 lac",
        "1 - 3 lac",
        "3 - 5 lac",
        "5 - 7.5 lac",
        "7.5 - 10 lac",
        "Above 10 lac"
      ),
      allowNull: true,
    },

    expectations : {
      type : DataTypes.TEXT ,
      allowNull : false
    }
  },
  {
    tableName: "basicPreference",
    timestamps: true,
  }
);

module.exports = BasicPreference;
