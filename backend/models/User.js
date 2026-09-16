import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true }
    },
    birthdate: {
      type: Date,
      required: [true, "Birthdate is required"]
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      sparse: true
    },
    phone: {
      countryCode: {
        type: String,
        required: true,
        default: '+1',
        trim: true
      },
      number: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            return /^\d{7,10}$/.test(v);
          },
          message: 'Invalid local phone number.'
        },
        sparse: true
      }
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password needs to be at least 8 characters long"],
      select: false
    },
    role: {
      type: String,
      required: [true, "Valid role needs to be given"],
      enum: ["coach", "athlete"],
      default: "athlete"
    },
    coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    coachCode: { type: Number }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual('phone.full').get(function () {
  if (!this.phone?.number) return null;
  return `${this.phone.countryCode || ''}${this.phone.number}`;
});

userSchema.virtual('name.full').get(function () {
  return `${this.name.lastName} ${this.name.firstName}`;
});

userSchema.pre('save', async function () {
  if (this.role === "coach") {
    this.coachId = undefined;
  }
});

const User = mongoose.model("User", userSchema);
export default User;