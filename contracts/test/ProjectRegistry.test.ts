import { expect } from "chai";
import { ethers } from "hardhat";
import type { ProjectRegistry } from "../typechain-types";

describe("ProjectRegistry", function () {
  let projectRegistry: ProjectRegistry;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const ProjectRegistry = await ethers.getContractFactory("ProjectRegistry");
    const deployedContract = await ProjectRegistry.deploy();
    await deployedContract.waitForDeployment();
    projectRegistry = deployedContract as unknown as ProjectRegistry;
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await projectRegistry.owner()).to.equal(owner.address);
    });

    it("Should start with zero projects", async function () {
      expect(await projectRegistry.getTotalProjects()).to.equal(0);
    });
  });

  describe("Project Creation", function () {
    it("Should create a new project", async function () {
      const tx = await projectRegistry.createProject(
        "Test Project",
        "A test project",
        "QmTestHash",
        ethers.parseEther("100"),
        ethers.ZeroAddress
      );

      await expect(tx)
        .to.emit(projectRegistry, "ProjectCreated")
        .withArgs(1, owner.address, "Test Project", ethers.parseEther("100"));

      expect(await projectRegistry.getTotalProjects()).to.equal(1);
    });

    it("Should fail if project name is empty", async function () {
      await expect(
        projectRegistry.createProject(
          "",
          "A test project",
          "QmTestHash",
          ethers.parseEther("100"),
          ethers.ZeroAddress
        )
      ).to.be.revertedWith("Project name required");
    });

    it("Should fail if bounty is zero", async function () {
      await expect(
        projectRegistry.createProject(
          "Test Project",
          "A test project",
          "QmTestHash",
          0,
          ethers.ZeroAddress
        )
      ).to.be.revertedWith("Total bounty must be greater than 0");
    });
  });

  describe("Project Retrieval", function () {
    beforeEach(async function () {
      await projectRegistry.createProject(
        "Test Project 1",
        "Description 1",
        "QmHash1",
        ethers.parseEther("100"),
        ethers.ZeroAddress
      );
    });

    it("Should retrieve project by ID", async function () {
      const project = await projectRegistry.getProject(1);
      expect(project.name).to.equal("Test Project 1");
      expect(project.owner).to.equal(owner.address);
      expect(project.totalBounty).to.equal(ethers.parseEther("100"));
    });

    it("Should retrieve projects by owner", async function () {
      await projectRegistry
        .connect(addr1)
        .createProject(
          "Test Project 2",
          "Description 2",
          "QmHash2",
          ethers.parseEther("50"),
          ethers.ZeroAddress
        );

      const ownerProjects = await projectRegistry.getProjectsByOwner(
        owner.address
      );
      const addr1Projects = await projectRegistry.getProjectsByOwner(
        addr1.address
      );

      expect(ownerProjects.length).to.equal(1);
      expect(addr1Projects.length).to.equal(1);
    });

    it("Should fail when retrieving non-existent project", async function () {
      await expect(projectRegistry.getProject(999)).to.be.revertedWith(
        "Project does not exist"
      );
    });
  });

  describe("Project Status Update", function () {
    beforeEach(async function () {
      await projectRegistry.createProject(
        "Test Project",
        "Description",
        "QmHash",
        ethers.parseEther("100"),
        ethers.ZeroAddress
      );
    });

    it("Should update project status", async function () {
      await expect(projectRegistry.updateProjectStatus(1, 1))
        .to.emit(projectRegistry, "ProjectStatusChanged")
        .withArgs(1, 0, 1); // ACTIVE -> PAUSED

      const project = await projectRegistry.getProject(1);
      expect(project.status).to.equal(1);
    });

    it("Should fail if non-owner tries to update", async function () {
      await expect(
        projectRegistry.connect(addr1).updateProjectStatus(1, 1)
      ).to.be.revertedWith("Only project owner can update");
    });
  });
});
