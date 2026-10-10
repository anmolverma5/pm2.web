import { ActionIcon, Anchor, Badge, CopyButton, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconFolder, IconPlugConnected, IconWorld } from "@tabler/icons-react";

import { serviceCatalog } from "@/utils/service-catalog";

/** Copy control - same affordance everywhere a value can be copied. */
function Copy({ value, label }: { value: string; label: string }) {
  return (
    <CopyButton value={value} timeout={1500}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? "Copied" : label} withArrow position="top">
          <ActionIcon
            size="sm"
            variant="subtle"
            color={copied ? "teal" : "gray"}
            onClick={copy}
            aria-label={label}
          >
            {copied ? <IconCheck size="0.85rem" /> : <IconCopy size="0.85rem" />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
  );
}

/**
 * One label/value row. Kept as a single component so the domain row and the
 * path row line up and behave identically.
 */
function MetaRow({
  icon,
  value,
  href,
  copyLabel,
}: {
  icon: React.ReactNode;
  value: string;
  href?: string;
  copyLabel: string;
}) {
  return (
    <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
      {icon}
      {href ? (
        <Anchor
          href={href}
          target="_blank"
          rel="noreferrer"
          size="xs"
          style={{ fontFamily: "monospace", overflowWrap: "anywhere" }}
        >
          {value}
        </Anchor>
      ) : (
        <Text size="xs" c="dimmed" style={{ fontFamily: "monospace", overflowWrap: "anywhere" }}>
          {value}
        </Text>
      )}
      <Copy value={value} label={copyLabel} />
    </Group>
  );
}

export default function ProcessMeta({ name }: { name: string }) {
  const info = serviceCatalog[name];
  if (!info) return null;

  return (
    <Stack gap={6} style={{ minWidth: 0 }}>
      <Text size="sm" c="dimmed">
        {info.description}
      </Text>

      <Group gap="lg" wrap="wrap" style={{ minWidth: 0 }}>
        {info.url && (
          <MetaRow
            icon={<IconWorld size="0.9rem" stroke={1.5} />}
            value={info.url.replace(/^https?:\/\//, "")}
            href={info.url}
            copyLabel="Copy domain"
          />
        )}
        {info.path && (
          <MetaRow
            icon={<IconFolder size="0.9rem" stroke={1.5} />}
            value={info.path}
            copyLabel="Copy path"
          />
        )}
        {info.port && (
          <Text size="xs" c="dimmed" style={{ fontFamily: "monospace" }}>
            :{info.port}
          </Text>
        )}
      </Group>

      {info.connects?.length ? (
        <Group gap={6} wrap="wrap">
          <IconPlugConnected size="0.9rem" stroke={1.5} />
          <Text size="xs" c="dimmed">
            Connects to
          </Text>
          {info.connects.map((target) => (
            <Badge key={target} size="sm" variant="light" radius="sm" style={{ textTransform: "none" }}>
              {target}
            </Badge>
          ))}
        </Group>
      ) : null}
    </Stack>
  );
}
