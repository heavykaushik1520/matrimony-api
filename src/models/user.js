const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const bcrypt = require("bcryptjs");
// password: { type: DataTypes.STRING, allowNull: false },
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female"),
      allowNull: false,
    },
    religion: {
      type: DataTypes.ENUM(
        "Buddhism",
        "Christian",
        "Hindu",
        "Muslim",
        "Jain",
        "Jewish",
        "Parsi",
        "Sikh",
        "Spiritual - not religious",
        "No Religion"
      ),
      allowNull: false,
    },
    caste: {
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
        "Wathi"
      ),
      allowNull: false,
    },
    subCaste: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    community: {
      type: DataTypes.ENUM(
        "Marathi",
        "Tamil",
        "Urdu",
        "Malyalam",
        "Kannada",
        "Punjabi",
        "Telugu",
        "Hindi",
        "Arabic",
        "Arunachali",
        "Assamese",
        "Bengali",
        "Bhojpuri",
        "Chattisgarhi",
        "Chinese",
        "English",
        "French",
        "Gujrati",
        "Haryanavi",
        "Pahari",
        "Manipuri",
        "Marwari",
        "Mizo",
        "Rajsthani",
        "Russian",
        "Spanish"
      ),
      allowNull: true,
    },

    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: "Date of birth must be a valid date format.",
        },
        isPastDate(value) {
          if (new Date(value) >= new Date()) {
            throw new Error("Date of birth cannot be in the future.");
          }
        },
        isAdult(value) {
          const today = new Date();
          const birthDate = new Date(value);
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          if (age < 18) {
            throw new Error("You must be at least 18 years old.");
          }
        },
      },
    },

    age: {
      type: DataTypes.VIRTUAL,
      get() {
        const today = new Date();
        const birthDate = new Date(this.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      },
    },

    timeOfBirth: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Phone number cannot be empty.",
        },
        isNumeric: {
          msg: "Phone number must contain only numbers.",
        },
        len: {
          args: [10, 10],
          msg: "Phone number must be exactly 10 digits long.",
        },
        isValidPhone(value) {
          if (!/^\d{10}$/.test(value)) {
            throw new Error(
              "Phone number must be exactly 10 digits and contain only numbers."
            );
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "Email cannot be empty.",
        },
        isEmail: {
          msg: "Invalid email format.",
        },
      },
    },
    knownLanguages: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    diet: {
      type: DataTypes.ENUM(
        "Vegetarian",
        "Non-Vegetarian",
        "Vegan",
        "Eggetarian"
      ),
      allowNull: false,
    },

    birthLocation: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    maritalStatus: {
      type: DataTypes.ENUM(
        "Never Married",
        "Widower",
        "Awaiting Divorce",
        "Divorced",
        "Widow"
      ),
      allowNull: false,
    },

    height: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        isNumeric: true,
        isPositive(value) {
          if (value <= 0) {
            throw new Error("Height must be a positive number.");
          }
        },
      },
    },

    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        isNumeric: true,
        isPositive(value) {
          if (value <= 0) {
            throw new Error("Weight must be a positive number.");
          }
        },
      },
    },

    bloodGroup: {
      type: DataTypes.ENUM("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"),
      allowNull: true,
      validate: {
        isIn: {
          args: [["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
          msg: "Blood group must be a valid type (e.g., A+, O-).",
        },
      },
    },
    physicalDisability: {
      type: DataTypes.ENUM("Yes", "No"),
      allowNull: false,
    },

    skinTone: {
      type: DataTypes.ENUM("Light", "Medium", "Olive", "Dark"),
      allowNull: true,
      validate: {
        isIn: {
          args: [["Light", "Medium", "Olive", "Dark"]],
          msg: "Skin tone must be one of 'Light', 'Medium', 'Olive', or 'Dark'.",
        },
      },
    },

    profilePhotos: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    hobbies: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        minHobbies(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("At least one hobby is required.");
          }
        },
      },
    },
    idProof: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6],
          msg: "Password must be at least 6 characters long.",
        },
        isComplex(value) {
          if (
            !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
              value
            )
          ) {
            throw new Error(
              "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)."
            );
          }
        },
      },
    },

    personalId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    termsAccepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },

    reset_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },

  {
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        user.password = await bcrypt.hash(
          user.password,
          await bcrypt.genSalt(10)
        );
      },
      beforeUpdate: async (user) => {
        if (user.changed("password"))
          user.password = await bcrypt.hash(
            user.password,
            await bcrypt.genSalt(10)
          );
      },
    },
  }
);

module.exports = User;
