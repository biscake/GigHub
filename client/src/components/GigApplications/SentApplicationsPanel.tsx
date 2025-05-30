import { TabPanel, Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { useGetApi } from "../../hooks/useGetApi";
import type { ApplicationListItemProps, GigApplication, SentApplicationResponse } from "../../types/application";
import { Spinner } from "../Spinner";
import type { User } from "../../types/auth";
import { timeAgo } from "../../utils/timeAgo";
import ApplicationListButton from "./ApplicationListButton";
import ApplicationListContent from "./ApplicationListContent";
import ApplicationDisclosureContainer from "./ApplicationDisclosureContainer";
import ApplicationPanel from "./ApplicationPanel";

// model GigApplication {
//   id        Int      @id @default(autoincrement())
//   createdAt DateTime @default(now())
//   userId    Int
//   user      User     @relation(fields: [userId], references: [id])
//   status    Status   @default(PENDING)
//   gig       Gig      @relation(fields: [gigId], references: [id], onDelete: Cascade)
//   gigId     Int
//   message   String?
// }

const user: User[] = [
  { username: "user1", id: 1 },
  { username: "user2", id: 2 },
  { username: "user3", id: 3 }
]

const Applications: SentApplicationResponse = {
  applications: [
    {
      id: 1,
      createdAt: new Date(),
      user: user[0],
      status: "PENDING",
      gig: {
        id: 1,
        imgUrl: "test.com",
        title: "Gig 1",
        price: 148.00,
        description: "Description for gig 1",
        author: user[1],
        category: "",
      },
      message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi, autem, minus vero, ipsum voluptatem quae ducimus ratione nemo amet reprehenderit culpa nesciunt nobis explicabo corrupti illo fugit animi alias expedita."
    },
    {
      id: 1,
      createdAt: new Date(),
      user: user[0],
      status: "PENDING",
      gig: {
        id: 2,
        imgUrl: "testasdf.com",
        title: "Gig 2",
        price: 18.00,
        description: "Description for gig 2",
        author: user[2],
        category: "",
      },
      message: "Message from user 1 to 3"
    },
    {
      id: 1,
      createdAt: new Date(),
      user: user[0],
      status: "PENDING",
      gig: {
        id: 1,
        imgUrl: "test.com",
        title: "Gig 1",
        price: 148.00,
        description: "Description for gig 1",
        author: user[1],
        category: "",
      },
      message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi, autem, minus vero, ipsum voluptatem quae ducimus ratione nemo amet reprehenderit culpa nesciunt nobis explicabo corrupti illo fugit animi alias expedita."
    },
    {
      id: 1,
      createdAt: new Date(),
      user: user[0],
      status: "PENDING",
      gig: {
        id: 1,
        imgUrl: "test.com",
        title: "Gig 1",
        price: 148.00,
        description: "Description for gig 1",
        author: user[1],
        category: "",
      },
      message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi, autem, minus vero, ipsum voluptatem quae ducimus ratione nemo amet reprehenderit culpa nesciunt nobis explicabo corrupti illo fugit animi alias expedita."
    },
    {
      id: 1,
      createdAt: new Date(),
      user: user[0],
      status: "PENDING",
      gig: {
        id: 1,
        imgUrl: "test.com",
        title: "Gig 1",
        price: 148.00,
        description: "Description for gig 1",
        author: user[1],
        category: "",
      },
      message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi, autem, minus vero, ipsum voluptatem quae ducimus ratione nemo amet reprehenderit culpa nesciunt nobis explicabo corrupti illo fugit animi alias expedita."
    },
    {
      id: 1,
      createdAt: new Date(),
      user: user[0],
      status: "PENDING",
      gig: {
        id: 1,
        imgUrl: "test.com",
        title: "Gig 1",
        price: 148.00,
        description: "Description for gig 1",
        author: user[1],
        category: "",
      },
      message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi, autem, minus vero, ipsum voluptatem quae ducimus ratione nemo amet reprehenderit culpa nesciunt nobis explicabo corrupti illo fugit animi alias expedita."
    },
    {
      id: 1,
      createdAt: new Date(),
      user: user[0],
      status: "PENDING",
      gig: {
        id: 1,
        imgUrl: "test.com",
        title: "Gig 1",
        price: 148.00,
        description: "Description for gig 1",
        author: user[1],
        category: "",
      },
      message: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi, autem, minus vero, ipsum voluptatem quae ducimus ratione nemo amet reprehenderit culpa nesciunt nobis explicabo corrupti illo fugit animi alias expedita."
    },

  ]
}

const SentApplicationsPanel = () => {
  // const { data, loading, error } = useGetApi<SentApplicationResponse>('/api/gigs/applications/sent');

  const error = undefined, loading = undefined;
  const data = Applications;

  if (error) {
    return (
      <p className="text-s text-rose-400 self-center my-auto">
        {error}
      </p>
    )
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <ApplicationPanel title="Sent">
      {data && data?.applications.length > 0
        ? data.applications.map((app, i) => <ApplicationListItem key={i} application={app} />)
        : <span>No Applications Found</span>
      }
    </ApplicationPanel>
  )
}

const ApplicationListItem: React.FC<ApplicationListItemProps> = ({ application, key }) => {
  return (
    <li key={key}>
      <ApplicationDisclosureContainer title={application.gig.title}>
        <ApplicationListContent title="Message">
          {application.message}
        </ApplicationListContent>
        <ApplicationListContent title="Gig Author">
          {application.gig.author.username}
        </ApplicationListContent>
        <span>Sent {timeAgo(application.createdAt)}</span>
        <div className="flex items-center">
          <div className="ml-auto flex gap-3">
            <ApplicationListButton className="bg-[#dac8c0]">Edit</ApplicationListButton>
            <ApplicationListButton className="bg-[#56362a]">Cancel Application</ApplicationListButton>
            <ApplicationListButton className="bg-[#b38b82]">View Gig</ApplicationListButton>
          </div>
        </div>
      </ApplicationDisclosureContainer>
    </li>
  )
}

export default SentApplicationsPanel;