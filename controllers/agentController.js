const Agent = require("../models/agent");
const User = require("../models/user");
const Notification = require("../models/notification");
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const sendEmail = require("../utils/emailService");
const DocumentSubmission = require("../models/documentSubmission");
const Document = require("../models/document");
const crypto = require("crypto");

// ================= REGISTER AGENT =================

exports.registerAgent = async (req, res, next) => {
  try {
    let {
      email,
      displayName,
      phoneNumber,
      dateOfBirth,
      primaryZip,
      coverageRadiusKm,
      hasCamera,
      hasVehicle,
      hasGps,
      hasHighSpeedInternet,
      experienceNotes
    } = req.body;

    email = email.trim().toLowerCase();

    logger.info(`Registration attempt: ${email}`);

    const existing = await Agent.findOne({ email });
    const duplicateAgent = await Agent.findOne({
  displayName,
  primaryZip,
  phoneNumber,
  dateOfBirth
});

if (duplicateAgent) {

  return res.status(400).json({
    message: "Duplicate record detected"
  });
}

    // =========================
    //  CASE 1: RE-REGISTER
    // =========================
    if (existing && existing.agentStatus === "REJECTED") {

      existing.displayName = displayName;
      existing.phoneNumber = phoneNumber;
      existing.dateOfBirth = dateOfBirth;
      existing.primaryZip = primaryZip;
      existing.coverageRadiusKm = coverageRadiusKm;
      existing.hasCamera = hasCamera;
      existing.hasVehicle = hasVehicle;
      existing.hasGps = hasGps;
      existing.hasHighSpeedInternet = hasHighSpeedInternet;
      existing.experienceNotes = experienceNotes;

      existing.agentStatus = "PENDING";
      existing.reviewComment = "";

      await existing.save();

  
      await Notification.create({
        agentId: existing._id,  
        type: "WELCOME",
        message: "Re-registration successfully.",
        sentAt: new Date(),
        status: "SENT"
      });

      await sendEmail(
        email,
        "Application Re-Submitted",
        `Hello ${displayName},

Your application has been resubmitted and is under review again.

We will notify you soon.`
      );

      return res.status(200).json({
        agentId: existing._id,
        agentStatus: "PENDING",
        message: "Re-registration successful. Awaiting admin approval."
      });
    }

    // =========================
    //  CASE 2: ALREADY EXISTS
    // =========================
    if (existing) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    // =========================
    //  CASE 3: NEW AGENT
    // =========================
    const agent = await Agent.create({
      userId: null,
      email,
      displayName,
       phoneNumber,
       dateOfBirth,
      primaryZip,
      coverageRadiusKm,
      hasCamera,
      hasVehicle,
      hasGps,
      hasHighSpeedInternet,
      experienceNotes,
      agentStatus: "PENDING"
    });

    logger.info(`Agent saved: ${agent._id}`);

    //  Notification
    await Notification.create({
      agentId: agent._id,
      type: "WELCOME",
      message: "Your form is under review.",
      sentAt: new Date(),
      status: "SENT"
    });

    //  Email
    await sendEmail(
      email,
      "Application Under Review",
      `Hello ${displayName},

Your form is being reviewed.
We will notify you soon.`
    );

    logger.info(`Email sent to ${email}`);

    return res.status(201).json({
      agentId: agent._id,
      agentStatus: "PENDING",
      message: "Registration successful"
    });

  } catch (error) {
    logger.error(`Agent registration error: ${error.message}`);
    next(error);
  }
};
// ================= ACTIVATE AGENT  =================


exports.activateAgent = async (req, res, next) => {
  try {
    logger.info(`Admin ${req.user.id} updating agent ${req.params.id}`);

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "User is not allowed to perform this operation"
      });
    }

    const { status, reviewComment } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status"
      });
    }

    const agent = await Agent.findById(req.params.id);

    if (!agent) {
      return res.status(404).json({
        message: "Agent not found"
      });
    }

    if (["APPROVED", "REJECTED"].includes(agent.agentStatus)) {
      return res.status(400).json({
        message: "Agent already processed"
      });
    }

    // ======================
    //  APPROVED FLOW
    // ======================
if (status === "APPROVED") {

  //  Check if user already exists
  let user = await User.findOne({ email: agent.email });

  let tempPassword = null;
  let link = null;

  //  Only create user if NOT exists
  if (!user) {

    //  Generate temp password
    tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    //  Create user
    user = await User.create({
      email: agent.email,
      password: hashedPassword,
      role: "AGENT",
    });

    //  Generate token
    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();
   

    // 🔗 Create link
     link = `http://3.110.55.186/pages/set-password?token=${token}`;

    //  Send email ONLY first time
    await sendEmail(
      agent.email,
      "Agent Approved",
      `Hello ${agent.displayName},

Your account is approved.

Please log in using the provided credentials to upload your documents.

Username: ${agent.email}
Login Password: ${tempPassword}

Set your password here:
${link}

⚠️ This link expires in 24 Hours.`
    );

  } else {
    logger.warn(`User already exists for ${agent.email}`);
  }

  //  Update agent
  agent.userId = user._id;
  agent.agentStatus = "APPROVED";
   agent.reviewComment = reviewComment || "Approved by admin";


  await agent.save();

  //  Notification
  await Notification.create({
    agentId: agent._id,
    type: "APPROVED",
    message: "Your agent account has been activated successfully.",
    sentAt: new Date(),
    status: "SENT"
  });

  return res.status(200).json({
    agentId: agent._id,
    agentStatus: agent.agentStatus,
    message: "Agent activated successfully"
  });
}

    // ======================
    //  REJECTED FLOW
    // ======================
    if (status === "REJECTED") {

      agent.agentStatus = "REJECTED";
       agent.reviewComment = reviewComment || "Rejected by admin";
    

      await agent.save();

      await sendEmail(
        agent.email,
        "Agent Rejected",
        `Hello ${agent.displayName},

We regret to inform you that your agent registration has been rejected.

Reason: ${reviewComment}

Please contact support or reapply.`

      );
      // Create welcome notification for agent
    await Notification.create({
      agentId: agent._id,
      type: "WELCOME",
      message: "Your agent account has been rejected please register again.",
      sentAt: new Date(),
      status: "SENT"
    });

      return res.status(200).json({
        agentId: agent._id,
        agentStatus: agent.agentStatus,
        message: "Agent rejected successfully"
      });
    }

  } catch (error) {
    logger.error(`Error updating agent: ${error.message}`);
    next(error);
  }
};

// ================= GET ALL AGENTS  =================

exports.getAgents = async (req, res, next) => {
  try {

    logger.info("GET /agents API called");

     // Ensure only ADMIN can access this API
    if (req.user.role !== "ADMIN") {
      logger.warn("Unauthorized access attempt to getAgents API");
      return res.status(403).json({
        message: "Only admin can view agents"
      });
    }
    // Extract query parameters for filtering and pagination

    const { status, email, page = 1, limit = 10 } = req.query;

    const filter = {};

       // Apply optional filter: agent status
    if (status) {
      filter.agentStatus = status;
    }

     // Apply optional filter: agent email
    if (email) {
      filter.email = email;
    }
     // Calculate pagination offset

    const skip = (page - 1) * limit;

    logger.info(`Fetching agents with filter: ${JSON.stringify(filter)}`);

    // Fetch paginated agent list
    const agents = await Agent.find(filter)
    .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

// Get total count for pagination metadata
    const totalRecords = await Agent.countDocuments(filter);

    logger.info(`Total agents fetched: ${agents.length}`);

// Send response with pagination details
    res.json({
      data: agents,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalRecords / Number(limit)),
        totalRecords
      }
    });

  } catch (error) {

    logger.error("Error in getAgents API", error);

    next(error);
  }
};

// ================= GET AGENT DASHBOARD =================

exports.getAgentDashboard = async (req, res, next) => {
  try {
    logger.info("GET /agent/dashboard API called");

    // Ensure only AGENT role can access dashboard
    if (req.user.role !== "AGENT") {
      logger.warn(`Unauthorized dashboard access attempt by user ${req.user.id}`);
      return res.status(403).json({
        message: "Only agents can access dashboard"
      });
    }

    logger.info(`Fetching dashboard for agent userId: ${req.user.id}`);

    // Fetch logged-in user
    const user = await User.findById(req.user.id);

    if (!user) {
      logger.warn(`User not found: ${req.user.id}`);
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Find corresponding agent profile
    const agent = await Agent.findOne({ userId: user._id });

    if (!agent) {
      logger.warn(`Agent not found for userId: ${user._id}`);
      return res.status(404).json({
        message: "Agent not found"
      });
    }

    logger.info(`Agent found: ${agent._id}`);

    // Fetch submission linked to this agent
    const submission = await DocumentSubmission.findOne({
      agentId: agent._id
    });

    let submissionStatus = "NONE";
    let documentsUploaded = 0;

    if (submission) {
      // Extract submission status
      submissionStatus = submission.status;

      documentsUploaded = await Document.countDocuments({
        submissionId: submission._id
      });

      logger.info(
        `Submission found for agent ${agent._id}, status: ${submissionStatus}, documents: ${documentsUploaded}`
      );
    } else {
      logger.info(`No submission found for agent ${agent._id}`);
    }

    // Fetch latest notifications (limit to 5)
    const notifications = await Notification.find({
      agentId: agent._id
    })
      .sort({ sentAt: -1 })
      .limit(5)
      .select("type message");

    logger.info(`Fetched ${notifications.length} notifications for agent ${agent._id}`);

    // Send dashboard summary response
    res.status(200).json({
      agentStatus: agent.agentStatus,
      currentSubmissionStatus: submissionStatus,
      submissionId: submission ? submission._id : null,
      documentsUploaded,
      notifications
    });

  } catch (error) {
    logger.error("Error in getAgentDashboard API", error);
    next(error);
  }
};