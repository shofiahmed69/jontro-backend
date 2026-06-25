const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stats = {};
  
  // JobApplications (resumes)
  const apps = await prisma.jobApplication.findMany({
    where: { resumeUrl: { contains: 'supabase.co' } }
  });
  stats.jobApplicationsWithSupabase = apps.length;

  // Projects
  const projects = await prisma.project.findMany({
    where: { thumbnail: { contains: 'supabase.co' } }
  });
  stats.projectsWithSupabase = projects.length;

  // BlogPosts
  const blogs = await prisma.blogPost.findMany({
    where: { heroImage: { contains: 'supabase.co' } }
  });
  stats.blogsWithSupabase = blogs.length;

  // TeamMembers
  const members = await prisma.teamMember.findMany({
    where: { avatar: { contains: 'supabase.co' } }
  });
  stats.teamMembersWithSupabase = members.length;

  // Testimonials
  const testimonials = await prisma.testimonial.findMany({
    where: { avatar: { contains: 'supabase.co' } }
  });
  stats.testimonialsWithSupabase = testimonials.length;

  console.log('Live Database Supabase URLs remaining:', stats);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
